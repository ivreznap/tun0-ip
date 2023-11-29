// util.js

import GLib from 'gi://GLib';

export const getLanIpOrTun0 = () => {
    const commandOutputBytes = GLib.spawn_command_line_sync('ip addr show tun0 | grep -Po \'inet \K[\d.]+\'')[1];
    const tun0Ip = String.fromCharCode.apply(null, commandOutputBytes).trim();

    if (tun0Ip) {
        return tun0Ip;
    } else {
        const lanIpCommandOutputBytes = GLib.spawn_command_line_sync('ip route get 1.1.1.1')[1];
        const lanIpCommandOutputString = String.fromCharCode.apply(null, lanIpCommandOutputBytes);
        const Re = new RegExp(/src [^ ]+/g);
        const matches = lanIpCommandOutputString.match(Re);
        if (matches) {
            return matches[0].split(' ')[1];
        } else {
            return '';
        }
    }
};
