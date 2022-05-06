#!/usr/bin/env node

import fs from 'fs/promises';
import glob from 'glob';
import ILC from 'istanbul-lib-coverage';
import { dirname, resolve } from 'path';
import yargs from 'yargs';

var options = yargs(process.argv.slice(2))
	.string('out')
	.describe('out', 'output path for merged raw coverage report JSON file')
	.normalize('out')
	.require(1, 'at least one path to raw coverage report JSON files is required')
	.string('_')
	.describe('_', 'paths to raw coverage report JSON files to merge')
	.help()
	.wrap(null)
	.usage('Usage: $0 --out path/to/output.json path/to/input.json "path/to/**.json"')
	.demandOption(['out', '_'])
	.version().argv;

const mergeCoverage = async function (inputFiles, outputFile) {
	const map = ILC.createCoverageMap({});
	await Promise.all(inputFiles
		.map((file) => fs.readFile(file, { encoding: 'utf-8' }))
		.map((json) => map.merge(JSON.parse(json))));
	await fs.mkdir(dirname(outputFile), { recursive: true });
	await fs.writeFile(outputFile, JSON.stringify(map), { encoding: 'utf-8' });
};

const main = async function () {
	const files = [];
	for (let input of options._) {
		const results = glob.sync(input, { nosort: true });
		files.push(...results);
	}
	mergeCoverage(files, resolve(options.out));
};

main();
