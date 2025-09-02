import {createContext, useContext, useEffect, useReducer, useState} from "react";

const BASE_URL = "http://localhost:8000";
const CitiesContext = createContext();
const initialState = {
    cities: [],
    isLoading: false,
    currentCity: {},
    error: "",
};

function reducer(state, action) {
    switch (action.type) {
        case 'loading':
            return { ...state, isLoading: true };
        case "cities/loaded":
            return {
                ...state,
                isLoading: false,
                cities: action.payload,
            };

        case "city/loaded":
            return {
                ...state,
                isLoading: false,
                currentCity: action.payload,
            }
        case "city/created":
            return {
                ...state,
                isLoading: false,
                cities: [...state.cities, action.payload],
                currentCity: action.payload,
            }

        case "city/deleted":
            return {
                ...state,
                isLoading: false,
                cities: state.cities.filter(city => city.id !== action.payload),
                currentCity: {},
            }

        case "rejected":
            return {
                ...state,
                isLoading: false,
                error: action.payload
            };

        default:
            throw new Error("Unknown action type");
    }
}


const CitiesProvider = ({ children }) => {
    const [{cities, isloading, currentCity, error }, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        async function loadCities() {
            dispatch({ type: "loading"});
            try {
                const response = await fetch(`${BASE_URL}/cities`);
                const data = await response.json();
                dispatch({ type: "cities/loaded", payload: data});
            } catch (error) {
                dispatch({
                    type: "rejected",
                    payload: "There are error loading cities",
                });
            }
        }
        loadCities();
    }, []);

    async function getCity(id){
        if (Number(id) === currentCity.id) return;
        dispatch({ type: "loading"});
        try {
            const response = await fetch(`${BASE_URL}/cities/${id}`);
            const data = await response.json();
            dispatch({ type: "city/loaded", payload: data});
        } catch (error) {
            dispatch({
                type: "rejected",
                payload: "There are error loading the city",
            });
        }
    }

    async function createCity(newCity){
        dispatch({ type: "loading"});
        try {
            const response = await fetch(`${BASE_URL}/cities/`, {
                method: "POST",
                body: JSON.stringify(newCity),
                headers: {
                    "Content-Type": "application/json",
                }
            });
            const data = await response.json();
            dispatch({ type: "city/created", payload: data});
        } catch (error) {
            dispatch({
                type: "rejected",
                payload: "There are error creating the city",
            });
        }
    }

    async function deleteCity(id){
        dispatch({ type: "loading"});
        try {
            const response = await fetch(`${BASE_URL}/cities/${id}`, {
                method: "DELETE",
            });
            dispatch({ type: "city/deleted", payload: id});
        } catch (error) {
            dispatch({
                type: "rejected",
                payload: "There are error deleting the city",
            });
        }
    }

    return <CitiesContext.Provider value={{
        cities,
        currentCity,
        isloading,
        error,
        getCity,
        createCity,
        deleteCity
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