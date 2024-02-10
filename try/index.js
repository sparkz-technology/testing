const Exceljs = require("exceljs");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);
const excelFilePath = path.join(__dirname, "DB.xlsx");

async function editStatusByUUID(uuid, status) {
  const workbook = new Exceljs.Workbook();
  const buffer = await readFile(excelFilePath);
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  const uuidrow = worksheet.getColumn("E").values;
  //   const statusrow = worksheet.getColumn("F").values;
  if (uuidrow.includes(uuid)) {
    const uuidrowIndex = uuidrow.indexOf(uuid);
    worksheet.getCell(`F${uuidrowIndex}`).value = status;
    await workbook.xlsx.writeFile(excelFilePath);
    const newBuffer = await readFile(excelFilePath);
    const newWorkbook = new Exceljs.Workbook();
    await newWorkbook.xlsx.load(newBuffer);
    const newWorksheet = newWorkbook.worksheets[0];
    const newStatusrow = newWorksheet.getColumn("F").values;
    console.log(newStatusrow[uuidrowIndex]);
    console.log(newStatusrow);
  }
}
