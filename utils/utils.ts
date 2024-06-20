import { Timestamp } from "firebase/firestore";
// type Timestamp = firebase.firestore.Timestamp;

export const findIn = (objeto: any, arrayFind: any[], byKey?: string) => {
  let res;
  if (byKey) {
    res = arrayFind.find((obj) => objeto[`${byKey}`] === obj[`${byKey}`]);
  } else {
    res = arrayFind.find((obj) => objeto.id === obj.id);
  }
  if (res === undefined) {
    return true;
  } else {
    return false;
  }
};

export const cleanString = (value: string): string => {
  let newValue = `${value}`;
  newValue = newValue.toLowerCase();
  newValue = newValue.replace(/á/gi, "a");
  newValue = newValue.replace(/é/gi, "e");
  newValue = newValue.replace(/í/gi, "i");
  newValue = newValue.replace(/ó/gi, "o");
  newValue = newValue.replace(/ú/gi, "u");
  return newValue;
};
export const numberWithDot = (x: any) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const rubroFormulaReader = (
  formula: string,
  coefA: number = 0,
  coefB: number = 0,
  coefC: number = 0,
  coefD: number = 0,
  coefE: number = 0,
  coefF: number = 0,
  gda: number = 1
) => {
  let reFormula: string = formula;

  reFormula = reFormula.replaceAll("[EXP]", "2.71828182845904**");
  reFormula = reFormula.replaceAll("](", "]*(");
  reFormula = reFormula.replaceAll(")[", ")*[");
  reFormula = reFormula.replaceAll("[A]", coefA + "");
  reFormula = reFormula.replaceAll("[B]", coefB + "");
  reFormula = reFormula.replaceAll("[C]", coefC + "");
  reFormula = reFormula.replaceAll("[D]", coefD + "");
  reFormula = reFormula.replaceAll("[E]", coefE + "");
  reFormula = reFormula.replaceAll("[F]", coefF + "");
  reFormula = reFormula.replaceAll("[GDA]", `${gda}`);
  const copyReFormula = reFormula;

  // console.log("log re formula:", reFormula);

  // Clean empty spaces
  const str = copyReFormula;

  // let result = Function("return " + reFormula)(); // which is same as "return 2+4"
  // console.log("function result", result);
  const output = eval(reFormula);
  alert("Prueba: " + str + "\nResultado:" + output);
};

export const formulaValidator = (str: string): string => {
  // Verification. First element must be any usable replaceable var
  // usable replacable var are the ones with:  []
  let reFormula = str;
  let charUbi: null | number = null;
  do {
    charUbi = null;
    for (var i = 0; i < reFormula.length; i++) {
      const char = reFormula.charAt(i);
      if (i === 0 && char !== "[" && char !== "(" && char !== "-") {
        charUbi = i + 1;
      }
    }
    if (charUbi) reFormula = reFormula.substring(charUbi);
  } while (charUbi);

  return reFormula;
};

// Export to csv
export const exportToCsv = (
  filename: string,
  rows: object[],
  headers: string[],
  headersAs?: string[],
  defaultSeparator: string = ","
): void => {
  if (!rows || !rows.length) {
    return;
  }
  const separator: string = defaultSeparator;

  if (headersAs) {
    if (headers.length !== headersAs.length) {
      throw new Error("headers and headersAs must be equal length");
    }
  }
  const columHearders = headers;

  const csvContent =
    `sep=${separator}\n` +
    (headersAs ? headersAs.join(separator) : columHearders.join(separator)) +
    "\n" +
    rows
      .map((row: any, i) => {
        return columHearders
          .map((k) => {
            let cell = k.includes(".")
              ? resolve(k, row)
              : row[k] === null || row[k] === undefined
              ? ""
              : row[k];
            if (!cell) {
              cell = "";
            }
            if (cell instanceof Timestamp) {
              cell = (cell as Timestamp).toDate().toLocaleString();
            } else if (cell instanceof Date) {
              cell = cell.toLocaleString();
            } else {
              cell = cell.toString().replace(/"/g, '""');
            }

            cell = cell.replace(/á/gi, "a");
            cell = cell.replace(/é/gi, "e");
            cell = cell.replace(/í/gi, "i");
            cell = cell.replace(/ó/gi, "o");
            cell = cell.replace(/ú/gi, "u");
            cell = cell.replace(/ñ/gi, "n");

            try {
              const newCell = Number(cell);
              if (newCell) {
                const strCell = String(newCell);
                if (
                  strCell.includes(".") &&
                  strCell.length > 5 &&
                  newCell < 90 &&
                  newCell > -90 &&
                  (String(k).includes("lat") ||
                    String(k).includes("lng") ||
                    String(k).includes("Lat") ||
                    String(k).includes("Lng") ||
                    String(k).includes("Latitud") ||
                    String(k).includes("Longitud"))
                ) {
                  cell = strCell.replace(".", ",");
                }
              }
            } catch {}

            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell + "";
          })
          .join(separator);
      })
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  //@ts-ignore
  if ((navigator as any).msSaveBlob) {
    // In case of IE 10+
    //@ts-ignore
    (navigator as any).msSaveBlob(blob, filename);
  } else {
    const link = document.createElement("a");
    if (link.download !== undefined) {
      // Browsers that support HTML5 download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};
export function resolve(path: string, obj: any) {
  return path.split(".").reduce(function (prev, curr) {
    return prev ? prev[curr] : null;
  }, obj);
}
//
