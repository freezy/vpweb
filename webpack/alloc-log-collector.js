let allocations = {};
let interval = 0;

export function instantiate(instance, location) {
	if (!interval) {
		return instance;
	}
	const className = instance.constructor.name;

	if (!allocations[className]) {
		allocations[className] = {};
	}
	if (!allocations[className][location]) {
		allocations[className][location] = 0;
	}
	allocations[className][location]++;

	return instance;
}

function logAllocations() {
	let n = 0;
	for (const className of Object.keys(allocations)) {
		const total = Object.values(allocations[className]).reduce((prev, curr) => prev + curr, 0);
		console.debug('[%s] %s', className, total);
		for (const location of Object.keys(allocations[className])) {
			console.debug('   %d @ %s', allocations[className][location], location);
			n += allocations[className][location] ;
		}
	}
	console.debug('----- %s instantiations total. ---------------------------------------------------------------------------------', n);
	allocations = {};
}

const glob = typeof window !== 'undefined' ? window : global;
glob.startAllocationLogging = function(time) {
	if (interval) {
		console.warn('Already logging!');
		return;
	}
	time = time || 10000;
	console.debug('Started logging every %ss.', time / 1000);
	interval = setInterval(logAllocations, time);
};

glob.stopAllocationLogging = function() {
	clearInterval(interval);
	interval = 0;
	console.debug('Stopped logging.');
};
