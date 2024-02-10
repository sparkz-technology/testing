import xlsx from "xlsx";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const workbook = xlsx.readFile(join(__dirname, "DB.xlsx"));
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const excelFilePath = join(__dirname, "DB.xlsx");

const dateArray = xlsx.utils.sheet_to_json(sheet);

// create a loop to iterate through the dateArray and make a POST request to the server
const createPromises = dateArray.map((data) => {
  return axios.post(
    "http://localhost:3000/create",
    {
      Username: data.Username,
      EmailID: data["Email ID"],
      FirstName: data["First Name"],
      LastName: data["Last Name"],
      UUID: data.UUID,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer <token>",
      },
    }
  );
});

// Use Promise.all to wait for all requests to complete
Promise.all(createPromises)
  .then((responses) => {
    responses.forEach((response) => {
      console.log(response.data, response.status);
      const { NEW_UUID, UUID } = response.data;
      checkStatus(NEW_UUID, UUID);
    });
  })
  .catch((error) => {
    console.error("Error making requests:", error);
  });

async function checkStatus(NEW_UUID, UUID) {
  try {
    const response = await axios.post(
      "http://localhost:3000/check",
      {
        NEW_UUID,
        UUID,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer <token>",
        },
      }
    );
    const status = response.status;
    console.log(response.status, "status");
    if (status === 200) {
      await updateStatusesByUUID(status, UUID);
    }
  } catch (error) {
    console.error("Error checking status:", error);
  }
}

async function updateStatusesByUUID(newStatus, uuid) {
  try {
    const workbook = xlsx.readFile(excelFilePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const dateArray = xlsx.utils.sheet_to_json(sheet);
    const updatedDateArray = dateArray.map((data) => {
      if (data.UUID === uuid) {
        return { ...data, Status: newStatus };
      }
      return data;
    });
    const newSheet = xlsx.utils.json_to_sheet(updatedDateArray);
    const newWorkbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(newWorkbook, newSheet, "Sheet1");
    xlsx.writeFile(newWorkbook, excelFilePath);
  } catch (error) {
    console.error(`Error updating status: ${error.message}`);
  }
}
// async function updateStatusesByUUID(status, uuid) {
// const workbook = new Exceljs.Workbook();
//   const buffer = await readFile(excelFilePath);
//   await workbook.xlsx.load(buffer);
//   const worksheet = workbook.worksheets[0];
//   const uuidrow = worksheet.getColumn("E").values;
//   //   const statusrow = worksheet.getColumn("F").values;
//   if (uuidrow.includes(uuid)) {
//     const uuidrowIndex = uuidrow.indexOf(uuid);
//     worksheet.getCell(`F${uuidrowIndex}`).value = status;
//     await workbook.xlsx.writeFile(excelFilePath);
//     const newBuffer = await readFile(excelFilePath);
//     const newWorkbook = new Exceljs.Workbook();
//     await newWorkbook.xlsx.load(newBuffer);
//     const newWorksheet = newWorkbook.worksheets[0];
//     const newStatusrow = newWorksheet.getColumn("F").values;
//     console.log(newStatusrow[uuidrowIndex]);
//     console.log(newStatusrow);
//   }
// }
