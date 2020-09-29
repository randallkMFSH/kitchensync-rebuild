import React from "react";
import "./header.css";

export const Header = () => {
    return (
        <header>
            <h1>KitchenSync</h1>
            <nav>
                <ul>
                    <li>
                        <a href="/create">New lobby</a>
                    </li>
                </ul>
            </nav>
        </header>
    );
};
