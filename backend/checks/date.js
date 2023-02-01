export default async function checkOnDate(tx, date) {
    date = new Date(date)

    return date < new Date();
}
