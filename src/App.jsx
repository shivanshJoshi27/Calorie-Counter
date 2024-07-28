import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const genAI = new GoogleGenerativeAI(
    "YOUR_API_KEY"
  );
 
  async function fileToGenerativePart(file) {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  }

  async function run() {
    setLoading(true);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const prompt =
      "You are an expert in nutritionist where you need to see the food items from the image and calculate the total calories, also provide the details of every food items with calories intake in below format:\n\nThe image contains a plate of food with a Item1, Item2, ------.\n1. Item 1 - no of calories\n2. Item 2 - no of calories\n-----\n-----\nFinally you can also mention whether the food is healthy or not and tell it's not food if the picture does not contain food.";

    const fileInputEl = document.querySelector("input[type=file]");
    const imageParts = await Promise.all(
      [...fileInputEl.files].map(fileToGenerativePart)
    );

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    setResponse(text);
    setLoading(false);
  }

  const [response, setResponse] = useState("");
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="main p-8">
      <div className="text-3xl font-bold">Gemini Health App</div>
      <label
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        htmlFor="large_size"
      >
        Large file input
      </label>
      <input
        className="block w-full text-lg text-black border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-black focus:outline-none dark:bg-gray-200 dark:border-gray-600 dark:placeholder-gray-400"
        id="large_size"
        type="file"
        onChange={handleFileChange}
      ></input>

      {selectedImage && (
        <div className="selected">
          <img
            src={selectedImage}
            alt="Selected"
            className="mt-4 mx-auto w-80 h-80"
          />
          <button
            type="button"
            className="w-50 mt-4 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={run}
          >
            Tell me the total calories
          </button>
        </div>
      )}

      {loading && (
        <div className="mt-4 flex justify-center">
          <div className="spinner-border text-blue-500" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}

      {response && (
        <div className="mt-4 w-full">
          <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
            {response}
          </pre>
        </div>
      )}
    </div>
  );
};

export default App;
