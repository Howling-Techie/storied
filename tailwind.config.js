/** @type {import("tailwindcss").Config} */
import {scopedPreflightStyles, isolateOutsideOfContainer} from "tailwindcss-scoped-preflight";

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [
        scopedPreflightStyles({
            isolationStrategy: isolateOutsideOfContainer(".no-twp", {
                plus: ".twp", // optional, if you have your Tailwind components under .no-twp, you need them to be preflighted
            }),
        }),
    ],
};