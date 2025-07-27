/*
    Panel Free
    GNOME Shell 45+ extension
    Copyright @fthx 2024
    License GPL v3
*/


import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { global } from 'resource:///org/gnome/shell/ui/environment.js';


export default class PanelFreeExtension {
    /**
     * This function checks the current state (in overview or number of windows)
     * and sets the panel's visibility accordingly.
     */
    _updatePanelVisibility() {
        // global.get_window_actors() gets a list of all open windows.
        // If the length is 0, it means no windows are open, so we are on the desktop.
        const onDesktop = global.get_window_actors().length === 0;

        if (Main.overview.visible || onDesktop) {
            Main.panel.visible = true;
        } else {
            Main.panel.visible = false;
        }
    }

    enable() {
        // We use connectObject to easily manage and disconnect signals related to the overview.
        Main.overview.connectObject(
            'showing', this._updatePanelVisibility.bind(this),
            'hiding', this._updatePanelVisibility.bind(this),
            this
        );

        // We also need to react to windows being opened or closed.
        // The 'notify::n-windows' signal on global.window_manager is emitted whenever
        // the number of open windows changes.
        this._windowSignalId = global.window_manager.connect('notify::n-windows', this._updatePanelVisibility.bind(this));

        // Set the initial state of the panel when the extension is enabled.
        this._updatePanelVisibility();
    }

    disable() {
        // Disconnect the signal handlers to clean up.
        Main.overview.disconnectObject(this);
        if (this._windowSignalId) {
            global.window_manager.disconnect(this._windowSignalId);
            this._windowSignalId = null;
        }

        // Ensure the panel is visible when the extension is disabled.
        Main.panel.visible = true;
    }
}