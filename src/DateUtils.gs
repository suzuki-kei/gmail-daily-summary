
/**
 *
 * 日付操作を提供する.
 *
 */
class DateUtils {

    /**
     *
     * 日付を加算する.
     *
     * @param {Date} date
     *     基準となる日付.
     *
     * @param {number} days
     *     加算する日数.
     *     負数を指定すると減算となる.
     *
     * @param {Date}
     *     date に days 日を加算した Date.
     *     引数の date は変更せず, 新しく生成した Date を返す.
     *
     */
    static advanceDays(date, days) {
        const advancedDate = new Date(date)
        advancedDate.setTime(date.getTime() + days * 1000 * 60 * 60 * 24)
        return advancedDate
    }

    /**
     *
     * JST を基準として今日の 00:00:00 を返す.
     *
     * 例えば現在時刻が "2020-01-01T12:34:56+09:00" の場合,
     * 戻り値は new Date("2020-01-01T00:00:00+09:00") となる.
     *
     * @return {Date}
     *     JST を基準として今日の 00:00:00 を表す Date.
     *
     */
    static jstToday() {
        const date = new Date()
        const dateString = Utilities.formatDate(date, "Asia/Tokyo", "yyyy-MM-dd")
        const datetimeString = Utilities.formatString("%sT00:00:00+09:00", dateString)
        return new Date(datetimeString)
    }

    /**
     *
     * JST を基準として日付文字列から Date を生成する.
     *
     * 以下, 引数と戻り値の例を示す.
     *
     *     fromDateString("2020-01-01")
     *     => new Date("2020-01-01T00:00:00+09:00")
     *
     *     fromDateString("2020-01-01T12:34:56")
     *     => new Date("2020-01-01T12:34:56+09:00")
     *
     * @param {string} dateString
     *     タイムゾーンの指定を含まない日付文字列.
     *     "yyyy-MM-dd" または "yyyy-MM-dd HH:mm:ss" 形式で指定する.
     *
     * @return {Date}
     *     JST を基準として dateString が表す Date.
     *
     */
    static fromJstDateString(dateString) {
        const values = dateString.split(/[^0-9]/).concat([0, 0, 0])
        const template = "%04d-%02d-%02dT%02d:%02d:%02d+09:00"
        const dateTimeString = Utilities.formatString(template, ...values)
        return new Date(dateTimeString)
    }

    /**
     *
     * JST を基準として年月日を表す文字列に変換する.
     *
     * 以下, 引数と戻り値の例を示す.
     *
     *     // "2020-01-01T15:00:00Z" は "2020-01-02T00:00:00+09:00" となる.
     *     toDateString(new Date("2020-01-01T15:00:00Z"))
     *     => "2020-01-02"
     *
     * @param {Date} date
     *     文字列に変換する Date.
     *
     * @return {string}
     *     date を yyyy-MM-dd 形式に変換した文字列.
     *
     */
    static toJstDateString(date) {
        return Utilities.formatDate(date, "Asia/Tokyo", "yyyy-MM-dd")
    }

}


