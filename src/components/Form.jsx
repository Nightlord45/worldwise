// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import {useEffect, useState} from "react";

import styles from "./Form.module.css";
import Button from "./Button.jsx";
import {useNavigate} from "react-router-dom";
import BackButton from "./BackButton.jsx";
import {useUrlPosition} from "../hooks/useUrlPosition.js";
import Message from "./Message.jsx";
import Spinner from "./Spinner.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {useGeolocation} from "../hooks/useGeolocation.js";
import {useCities} from "../contexts/CitiesContext.jsx";

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

function Form() {
  const navigate = useNavigate();
  const [lat, lng] = useUrlPosition();
  const { createCity, isLoading }= useCities();
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [isLoadingGeolocation, setIsLoadingGeolocation] = useState(false);
  const [emoji, setEmoji] = useState("");
  const [geocodingError, setGeocodingError] = useState("");

  useEffect(() => {
      if(!lat && !lng) return;

      async function fetchCityData() {
          try {
            setGeocodingError(null);
            setIsLoadingGeolocation(true);
            const res = await fetch(`${BASE_URL}?latitude=${lat}&longitude=${lng}`);
            const data = await res.json();

            if (!data.countryCode) throw new Error("That doesn't seem to be a city. Click somewhere else");

            setCityName(data.city || data.locality || "");
            setCountry(data.countryName);
            setEmoji(convertToEmoji(data.countryCode))
          } catch (err){
              setGeocodingError(err.message);
              console.error(err);
          } finally {
              setIsLoadingGeolocation(false);
          }
      }
      fetchCityData();
  }, [lat, lng]);

  async function handleSubmit(e) {
      e.preventDefault();
      if(!cityName || !date) return;

      const newCity = {
          cityName,
          country,
          emoji,
          date,
          notes,
          position: {lat, lng},
      }
      await createCity(newCity);
      navigate("/app/cities");
  }


  if(isLoadingGeolocation) return <Spinner />;

  if(!lat && !lng) return <Message message="Start by clicking on the map" />;
  if (geocodingError) return <Message message={geocodingError} />;

  return (
    <form className={`${styles.form} ${isLoading ? styles.loading : ''}`}
          onSubmit={handleSubmit}>
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
         <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <DatePicker showMonthYearDropdown="true"
                    onChange={(date) => setDate(date)}
                    selected={date}
                    dateFormat="dd/MM/yyyy"
        />
        {/*<input*/}
        {/*  id="date"*/}
        {/*  onChange={(e) => setDate(e.target.value)}*/}
        {/*  value={date}*/}
        {/*/>*/}
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type='primary'>Add</Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
