import {Flipper} from '../../vpx-toolbox/dist/lib/vpt/flipper/flipper'
import {FlipperData} from '../../vpx-toolbox/dist/lib/vpt/flipper/flipper-data'

let angle = 0;
let table = null;

setInterval(() => {
	if (table) {
		angle = 5; //(angle + 15) % 360;
		const matrix = table.flippers.LeftFlipper.getDynamicMatrix(angle);
		postMessage({ LeftFlipper: matrix.getElements() });
	}

}, 200);

onmessage = e => {
	if (e.data.table) {
		table = e.data.table;
		for (const name of Object.keys(table.flippers)) {
			table.flippers[name] = new Flipper(name, FlipperData.fromSerialized(table.flippers[name].itemName, table.flippers[name].data));
		}
	}
	console.log('[worker] got message:', e);
};
