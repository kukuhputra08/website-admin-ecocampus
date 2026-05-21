import { useState } from "react";
import { uploadImageToCloudinary } from "../services/cloudinaryService";

function TestUpload() {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload() {
    if (!file) {
      alert("Pilih gambar dulu");
      return;
    }

    try {
      setIsUploading(true);

      const url = await uploadImageToCloudinary(file);

      setImageUrl(url);
      console.log("Uploaded image URL:", url);
    } catch (error) {
      console.error(error);
      alert(error.message || "Upload gagal");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-xl rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">
          Test Upload Cloudinary
        </h1>

        <input
          type="file"
          accept="image/*"
          onChange={(event) => setFile(event.target.files[0])}
          className="mt-6 block w-full rounded-2xl border border-slate-200 p-3"
        />

        <button
          type="button"
          onClick={handleUpload}
          disabled={isUploading}
          className="mt-4 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-300"
        >
          {isUploading ? "Uploading..." : "Upload Image"}
        </button>

        {imageUrl && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-slate-700">
              Uploaded URL:
            </p>

            <p className="break-all rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
              {imageUrl}
            </p>

            <img
              src={imageUrl}
              alt="Uploaded preview"
              className="mt-4 h-64 w-full rounded-3xl object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default TestUpload;