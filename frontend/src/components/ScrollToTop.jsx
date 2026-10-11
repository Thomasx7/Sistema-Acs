import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
    const { pathname } = useLocation();
    const restorationConfigured = useRef(false);

    useLayoutEffect(() => {
        if (!restorationConfigured.current) {
            window.history.scrollRestoration = "manual";
            restorationConfigured.current = true;
        }

        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [pathname]);

    return null;
}

export default ScrollToTop;
