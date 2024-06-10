import {createContext, useContext, useEffect, useState} from 'react';


interface UrlContextProps {
    setSearchParamSet: (searchParamSet: Record<string, string | null>) => void;
    setHashParamSet: (hashParamSet: Record<string, string | null>) => void;
    copyToClipboard: (searchParamSet: Record<string, string | null>, hashParamSet: Record<string, string | null>) => void;
}

const UrlContext = createContext <UrlContextProps> ({} as UrlContextProps);


const UrlContextProvider = ({children}) => {
    const [hashParam, setHashParam] = useState<string>(window.location.hash.substring(1));
    useEffect(() => {
        setHashParam(window.location.hash.substring(1));
    }, [window.location.hash]);

    const setSearchParamSetHelper = (searchParamSet: Record<string, string | null>) => {
        const newSearchParam = new URLSearchParams(window.location.search.substring(1));
        const filePath = searchParamSet['filePath'];
        delete searchParamSet['filePath'];

        for (const [key, value] of Object.entries(searchParamSet)) {
            if (null === value) {
                newSearchParam.delete(key);
            } else {
                newSearchParam.set(key, value);
            }
        }
        if (filePath) {
            newSearchParam.set('filePath', filePath);
        }
        return newSearchParam;
    }

    const setSearchParamSet = (searchParamSet: Record<string, string | null>) => {
        const newUrl = new URL(window.location.href);
        newUrl.search = setSearchParamSetHelper(searchParamSet).toString();
        window.history.pushState({}, '', newUrl.toString());
    }
    const setHashParamSetHelper = (hashParamSet: Record<string, string | null>) => {
        const newHashParam = new URLSearchParams(hashParam);
        for (const [key, value] of Object.entries(hashParamSet)) {
            if (null === value) {
                newHashParam.delete(key);
            } else {
                newHashParam.set(key, value);
            }
        }
        return newHashParam;
    };

    const setHashParamSet = (hashParamSet: Record<string, string | null>) => {
        const newUrl = new URL(window.location.href);
        newUrl.hash = setHashParamSetHelper(hashParamSet).toString();
        window.history.pushState({}, '', newUrl.toString());
    }

    const copyToClipboard = (searchParamSet: Record<string, string | null>, hashParamSet: Record<string, string | null>) => {
        const newUrl = new URL(window.location.href);
        newUrl.search = setSearchParamSetHelper(searchParamSet).toString();
        newUrl.hash = setHashParamSetHelper(hashParamSet).toString();
        navigator.clipboard.writeText(newUrl.toString());
    }

    return (
        <UrlContext.Provider value={{setSearchParamSet, setHashParamSet, copyToClipboard}}>
            {children}
        </UrlContext.Provider>
    );

}

const UserComponent = () => {
    const {setSearchParamSet} = useContext(UrlContext);

}
const App = () => {
    return (
        <>
            <UrlContextProvider>
                <UserComponent/>
            </UrlContextProvider>
            <StateContextProvider>
                <Viewer/>
            </StateContextProvider>
        </>
    );
};

export default App;
