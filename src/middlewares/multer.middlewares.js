import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(import.meta.dirname, "../../public/temp/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + "" + path.extname(file.originalname)
    );
  },
});
console.log(import.meta.dirname);

export const upload = multer({ storage });
