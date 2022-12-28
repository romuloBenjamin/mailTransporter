let nfe = {}
nfe.date = {}
const getDate = () => {
    let data = new Date();
    nfe.date.date = `${data.getFullYear()}-${(data.getMonth() + 1).toString().padStart(2, '0')}-${data.getDate().toString().padStart(2, '0')}`
    nfe.date.hour = `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`
    nfe.date.fullDate = `${nfe.date.date} ${nfe.date.hour}`
}
getDate()
let data = {}
data.date = new Date("2021-01-02 00:00:00")
let mindate = new Date("2021-01-01 00:00:00")

console.log(data.date < mindate);