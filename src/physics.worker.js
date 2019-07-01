let angle = 0;

setInterval(() => {
	angle = (angle + 15) % 360;
	postMessage({ angle });
}, 1000);

onmessage = e => {
	console.log('[worker] got message:', e);
};
