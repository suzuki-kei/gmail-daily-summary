
/**
 *
 * 指定した条件に該当する Gmail のメール件数の日次集計.
 *
 */
class GmailDailySummary {

    /**
     *
     * 指定された期間のメールを集計する.
     *
     * Sheet に結果が記録されている日付については更新しない.
     *
     * @param {string} sheetName
     *     集計結果を記録する Sheet の名前.
     *
     * @param {string} queryBase
     *     Gmail の検索クエリ.
     *     日付の期間を指定する before, after を含んではならない.
     *
     * @param {Date} dateFrom
     *     集計期間の開始日.
     *
     * @param {Date} dateTo
     *     集計期間の終了日.
     *     dateTo で指定した日も集計期間に含む.
     *
     */
    update(sheetName, queryBase, dateFrom, dateTo) {
        const summarySheet = this._getOrCreateSheet(sheetName)
        const summaryMap = this._toSummaryMapFromSheet(summarySheet)
        this._updateSummaryMap(summaryMap, queryBase, dateFrom, dateTo)
        this._updateSummarySheet(summarySheet, summaryMap)
    }

    /**
     *
     * 集計結果を記録する Sheet を取得または作成する.
     *
     * @param {string} sheetName
     *     集計結果を記録する Sheet の名前.
     *
     * @return {Sheet}
     *     sheetName で指定される Sheet.
     *     存在しない場合は新しく作成した Sheet.
     *
     */
    _getOrCreateSheet(sheetName) {
        function getSheet() {
            const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
            return spreadsheet.getSheetByName(sheetName)
        }
        function createSheet() {
            const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
            const sheet = spreadsheet.insertSheet()
            sheet.setName(sheetName)
            const headers = ["日付", "件数"]
            sheet.appendRow(headers)
            return sheet
        }
        return getSheet() || createSheet()
    }

    /**
     *
     * Sheet から集計結果を取得する.
     *
     * @param {Sheet} sheet
     *     集計結果が記録された Sheet.
     *
     * @return {Map<string, number>}
     *     キーが日付, 値がメール件数である Map.
     *
     */
    _toSummaryMapFromSheet(sheet) {
        const range = sheet.getDataRange()
        const values = range.getValues()
        const map = new Map()

        for(let i = 1; i < values.length; i++) {
            const date = values[i][0]
            if(!(date instanceof Date)) {
                // 日付以外の値が設定されている場合は無視する.
                continue
            }
            const count = values[i][1]
            if(typeof(count) !== "number") {
                // 数値以外の値が設定されている場合は無視する.
                continue
            }
            const dateString = DateUtils.toJstDateString(values[i][0])
            map.set(dateString, count)
        }
        return map
    }

    /**
     *
     * 集計結果の Map を更新する.
     *
     * @param {Map<string, number>} summaryMap
     *     集計結果を保持する Map.
     *     Gmail の集計結果によって summaryMap が更新される.
     *
     * @param {string} queryBase
     *     Gmail の検索クエリ.
     *     日付の期間を指定する before, after を含んではならない.
     *
     * @param {Date} dateFrom
     *     集計期間の開始日.
     *
     * @param {Date} dateTo
     *     集計期間の終了日.
     *     dateTo で指定した日も集計期間に含む.
     *
     */
    _updateSummaryMap(summaryMap, queryBase, dateFrom, dateTo) {
        let targetDate = new Date(dateFrom)
        while(targetDate <= dateTo) {
            const targetDateString = DateUtils.toJstDateString(targetDate)
            if(typeof summaryMap.get(targetDateString) === "number") {
                Logger.log(Utilities.formatString("targetDate=[%s] SKIP", targetDateString))
            } else {
                const after = targetDateString
                const before = DateUtils.toJstDateString(DateUtils.advanceDays(targetDate, 1))
                const query = Utilities.formatString("%s after:%s before:%s", queryBase, after, before).trim()
                Logger.log("targetDate=[%s], query=[%s]", targetDateString, query)
                summaryMap.set(after, this._getMailCount(query))
            }
            targetDate = DateUtils.advanceDays(targetDate, 1)
        }
    }

    /**
     *
     * Gmail から検索クエリに該当するメールの件数を取得する.
     *
     * @param {string} query
     *     Gmail の検索クエリ.
     *
     * @return {number}
     *     検索クエリに該当するメールの件数.
     *
     */
    _getMailCount(query) {
        var start = 0
        var max = 500
        var count = 0
        for(;;) {
            const threads = GmailApp.search(query, start, max)
            if(threads.length === 0) {
                break
            }
            count += GmailApp.getMessagesForThreads(threads).flat().length
            start += threads.length
        }
        return count
    }

    /**
     *
     * 集計結果を保持する Map の内容で Sheet を上書き更新する.
     *
     * @param {Sheet} summarySheet
     *     集計結果を記録する Sheet.
     *
     * @param {Map<string, number>} summaryMap
     *     集計結果を保持する Map.
     *
     */
    _updateSummarySheet(summarySheet, summaryMap) {
        const values = this._toSummaryValuesFromMap(summaryMap)
        const range = summarySheet.getRange(2, 1, values.length, 2)
        range.setValues(values)
    }

    /**
     *
     * 集計結果を保持する Map を二次元配列に変換する.
     *
     * @param {Map<string, number>} summaryMap
     *     集計結果を保持する Map.
     *
     * @return {Array.<Array.<string, number>>}
     *     日付とメール件数からなる配列の配列.
     *     日付の昇順にソートされた状態で返す.
     *
     */
    _toSummaryValuesFromMap(summaryMap) {
        const values = Array.from(summaryMap.entries())
        values.sort((pair1, pair2) => {
            const time1 = new Date(pair1[0]).getTime()
            const time2 = new Date(pair2[0]).getTime()
            return time1 - time2
        })
        return values
    }

}

