import {app, BrowserWindow, ipcMain} from "electron";
import path from "path";
//import contextMenu from "electron-context-menu";
import {fileFunctions} from "./utils/fileUtils";
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    app.quit();
}

const setupIpcHandlers = () => {
    // Project functions
    ipcMain.handle("projects:createProject", async (_, newProject) => fileFunctions.projects.createProject(newProject));
    ipcMain.handle("projects:getProjects", async () => fileFunctions.projects.getProjects());
    ipcMain.handle("projects:getProject", async (_, projectId) => fileFunctions.projects.getProject(projectId));

    // Chapter functions
    ipcMain.handle("chapters:getChapters", async (_, projectId) => fileFunctions.chapters.getChapters(projectId));
    ipcMain.handle("chapters:getChapter", async (_, projectId, id) => fileFunctions.chapters.getChapter(projectId, id));
    ipcMain.handle("chapters:insertChapter", async (_, chapter) => fileFunctions.chapters.insertChapter(chapter));
    ipcMain.handle("chapters:updateChapter", async (_, updatedChapter) => fileFunctions.chapters.updateChapter(updatedChapter));
    ipcMain.handle("chapters:deleteChapter", async (_, projectId, id) => fileFunctions.chapters.deleteChapter(projectId, id));
    ipcMain.handle("chapters:reorderChapters", async (_, projectId, newOrder) => fileFunctions.chapters.reorderChapters(projectId, newOrder));

    // Scene functions
    ipcMain.handle("scenes:getScenes", async (_, projectId) => fileFunctions.scenes.getScenes(projectId));
    ipcMain.handle("scenes:getScene", async (_, projectId, chapterId, id) => fileFunctions.scenes.getScene(projectId, chapterId, id));
    ipcMain.handle("scenes:insertScene", async (_, scene) => fileFunctions.scenes.insertScene(scene));
    ipcMain.handle("scenes:updateScene", async (_, updatedScene) => fileFunctions.scenes.updateScene(updatedScene));
    ipcMain.handle("scenes:deleteScene", async (_, projectId, chapterId, id) => fileFunctions.scenes.deleteScene(projectId, chapterId, id));
    ipcMain.handle("scenes:reorderScenes", async (_, projectId, newOrder) => fileFunctions.scenes.reorderScenes(projectId, newOrder));

    // Location functions
    ipcMain.handle("locations:getLocations", async (_, projectId) => fileFunctions.locations.getLocations(projectId));
    ipcMain.handle("locations:getLocation", async (_, projectId, id) => fileFunctions.locations.getLocation(projectId, id));
    ipcMain.handle("locations:insertLocation", async (_, location) => fileFunctions.locations.insertLocation(location));
    ipcMain.handle("locations:updateLocation", async (_, updatedLocation) => fileFunctions.locations.updateLocation(updatedLocation));
    ipcMain.handle("locations:deleteLocation", async (_, projectId, id) => fileFunctions.locations.deleteLocation(projectId, id));

    // Character functions
    ipcMain.handle("characters:getCharacters", async (_, projectId) => fileFunctions.characters.getCharacters(projectId));
    ipcMain.handle("characters:getCharacter", async (_, projectId, id) => fileFunctions.characters.getCharacter(projectId, id));
    ipcMain.handle("characters:insertCharacter", async (_, character) => fileFunctions.characters.insertCharacter(character));
    ipcMain.handle("characters:updateCharacter", async (_, updatedCharacter) => fileFunctions.characters.updateCharacter(updatedCharacter));
    ipcMain.handle("characters:deleteCharacter", async (_, projectId, id) => fileFunctions.characters.deleteCharacter(projectId, id));
};

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1600,
        height: 1000,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    setupIpcHandlers();

    // mainWindow.menuBarVisible = false;

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
    }

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
};

// Add Right-click support
//contextMenu({});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
