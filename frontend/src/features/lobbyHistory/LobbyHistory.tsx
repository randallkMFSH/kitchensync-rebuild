import { selectLobbyPersist, selectLobbyTitleLCE } from "@features/lobbyInfo/lobbyInfoSelectors";
import { getDataOrPrevious } from "@util/LCE";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import "./lobbyHistory.css";

interface HistoryEntry {
    lastVisit: number;
    title: string;
}
interface HistoryMap {
    [id: string]: HistoryEntry;
}
const id = location.pathname.split("/")[1];

export const LobbyHistory = () => {
    const [history, setHistory] = useState<HistoryMap>({});
    const titleLCE = useSelector(selectLobbyTitleLCE);
    const persist = useSelector(selectLobbyPersist);
    const title = getDataOrPrevious(titleLCE);
    useEffect(() => {
        let lobbyHistory: HistoryMap = {};
        try {
            const historyStorageEntry = localStorage.getItem("kitchensync:history");
            if (historyStorageEntry) {
                lobbyHistory = JSON.parse(historyStorageEntry);
            }
        } catch (e) {}
        if (persist) {
            if (title) {
                lobbyHistory[id] = { lastVisit: Date.now(), title };
            }
        } else {
            delete lobbyHistory[id];
        }
        const sorted = Object.entries(history).sort((a, b) => b[1].lastVisit - a[1].lastVisit);
        if (sorted.length > 5) {
            sorted.slice(5).forEach((entry) => delete lobbyHistory[entry[0]]);
        }

        localStorage.setItem("kitchensync:history", JSON.stringify(lobbyHistory));
        setHistory(lobbyHistory);
    }, [title, persist]);

    const entries = Object.entries(history)
        // Don't show the current lobby
        .filter((historyEntry) => historyEntry[0] !== id)
        .sort((a, b) => b[1].lastVisit - a[1].lastVisit)
        .map((historyItem) => (
            <li key={historyItem[0]}>
                <a href={`/${historyItem[0]}`}>{historyItem[1].title}</a>
            </li>
        ));
    if (entries.length === 0) {
        return null;
    }
    return (
        <section className="history">
            <h4>Other lobbies you've been to:</h4>
            <ol>{entries}</ol>
        </section>
    );
};
