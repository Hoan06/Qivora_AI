import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { routers } from "./routers/routers";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import axios from "axios";

axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={routers}></RouterProvider>
    </Provider>
  </StrictMode>,
);
