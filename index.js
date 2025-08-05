import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import ejs from "ejs";

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const Base_URL = "https://api.weatherapi.com/v1/future.json";
const API_Key = "f2fa5a5a505a4eecad305401250408";

const today = new Date();
const futureDate = new Date(today);
futureDate.setDate(today.getDate() + 14);

// Format it to yyyy-mm-dd
const yyyy = futureDate.getFullYear();
const mm = String(futureDate.getMonth() + 1).padStart(2, '0');
const dd = String(futureDate.getDate()).padStart(2, '0');

const formattedDate = `${yyyy}-${mm}-${dd}`;


app.get("/", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    // Just render a default page that prompts for location
    return res.render("index.ejs", {
      userRegion: "your area",
      weatherReport: "Location not detected",
      advice: "Please allow location access to get your weather forecast.",
    });
  }

  try {
    const response = await axios.get(Base_URL, {
      params: {
        key: API_Key,
        q: `${lat},${lon}`,
        dt: formattedDate, 
      },
    });

    const report = response.data.forecast.forecastday[0].day.condition.text;
    const icon = response.data.forecast.forecastday[0].day.condition.icon;
    const region = response.data.location.name;


    if (report === "Moderate or heavy rain shower") {
     var feeback = "Bring your umbrella, if you must step outside.";
    } else {
      feeback = "The heat might be too much, get yourself cool.";
    }

    res.render("index.ejs", {
      userRegion: region,
      weatherReport: report,
      image: icon,
      advice: feeback,
    });

  } catch (error) {
    console.error("Error: ", error.message);
    res.status(500).send("Something went wrong.");
  }
});


app.listen(port, ()=>{
    console.log(`Now listening on port ${port}`)
})


