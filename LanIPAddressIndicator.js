import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

export class LanIPAddressIndicator extends PanelMenu.Button {
    _init() {
        super._init(0, "LAN IP Address Indicator", false);

        this.buttonText = new St.Label({
            text: 'Loading...',
            y_align: Clutter.ActorAlign.CENTER
        });
        this.add_child(this.buttonText);
        this._updateLabel();
    }

    _updateLabel() {
        const priority = 0;
        const refreshTime = 5;

        if (this._timeout) {
            GLib.source_remove(this._timeout);
            this._timeout = undefined;
        }
        this._timeout = GLib.timeout_add_seconds(priority, refreshTime, () => { this._updateLabel() });

        const tun0IP = this._getTun0IP();
        this.buttonText.set_text(tun0IP ? tun0IP : this._getLanIP());
    }

    _getTun0IP() {
        const command_output_bytes = GLib.spawn_command_line_sync('ip addr show dev tun0 | grep -oP "(?<=inet\\s)\\d+\\.\\d+\\.\\d+\\.\\d+"')[1];
        const command_output_string = String.fromCharCode.apply(null, command_output_bytes);
        return command_output_string.trim();
    }

    _getLanIP() {
        const command_output_bytes = GLib.spawn_command_line_sync('ip route get 1.1.1.1')[1];
        const command_output_string = String.fromCharCode.apply(null,  command_output_bytes);
        const Re = new RegExp(/src [^ ]+/g);
        const matches = command_output_string.match(Re);
        return matches ? matches[0].split(' ')[1] : '';
    }

    stop() {
        if (this._timeout) {
            GLib.source_remove(this._timeout);
        }
        this._timeout = undefined;
        this.menu.removeAll();
    }
}
