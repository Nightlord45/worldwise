import {createContext, useContext, useEffect, useState} from "react";

const BASE_URL = "http://localhost:8000";
const CitiesContext = createContext()

const CitiesProvider = ({ children }) => {
    const [cities, setCities] = useState([]);
    const [currentCity, setCurrentCity] = useState({});
    const [isloading, setIsLoading] = useState(false);

    useEffect(() => {
        async function loadCities() {
            try {
                setIsLoading(true);
                const response = await fetch(`${BASE_URL}/cities`);
                const data = await response.json();
                setCities(data);
            } catch (error) {
                alert("There are error loading data");
            } finally {
                setIsLoading(false);
            }
        }
        loadCities();
    }, []);

    async function getCity(id){
        try {
            setIsLoading(true);
            const response = await fetch(`${BASE_URL}/cities/${id}`);
            const data = await response.json();
            setCurrentCity(data);
        } catch (error) {
            alert("There are error loading data");
        } finally {
            setIsLoading(false);
        }
    }

    async function createCity(newCity){
        try {
            setIsLoading(true);
            const response = await fetch(`${BASE_URL}/cities/`, {
                method: "POST",
                body: JSON.stringify(newCity),
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const data = await response.json();
            setCities(cities => [...cities, data]);
        } catch (error) {
            alert("There are error loading data");
        } finally {
            setIsLoading(false);
        }
    }

    return <CitiesContext.Provider value={{
        cities,
        currentCity,
        isloading,
        getCity,
        createCity,
    }}>
        {children}
    </CitiesContext.Provider>;
}

function useCities() {
    const context = useContext(CitiesContext);
    if(context === undefined) throw new Error("CitiesContext was used outside the CitiesProvider");
    return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export {CitiesProvider, useCities};