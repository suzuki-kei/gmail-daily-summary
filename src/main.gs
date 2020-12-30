
function main() {
    const sheetName = "Gmail Daily Summary"
    const query = ""
    const dateFrom = DateUtils.fromJstDateString("2020-01-01")
    const dateTo = DateUtils.advanceDays(DateUtils.jstToday(), -1)
    new GmailDailySummary().update(sheetName, query, dateFrom, dateTo)
}

