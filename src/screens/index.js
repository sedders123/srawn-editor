import Editor from "./Editor";
import Home from "./Home";

export const Routes = [{ path: "/", element: <Home /> }, { path: "/editor/:id", element: <Editor /> }];
