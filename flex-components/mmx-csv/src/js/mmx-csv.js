/**
 * MMX / CSV
 */

class MMX_CSVParser {
	#csv;
	#delimiter;
	#enclosure;
	#trim;
	#state;

	constructor(options) {
		this.#setOptions(options);
	}

	#setOptions({delimiter, enclosure, trim} = {}) {
		this.#delimiter = typeof delimiter === 'string' ? delimiter : ',';
		this.#enclosure = typeof enclosure === 'string' ? enclosure : '"';
		this.#trim = typeof trim === 'boolean' ? trim : false;
	}

	#getOptions() {
		return {
			delimiter: this.#delimiter,
			enclosure: this.#enclosure,
			trim: this.#trim
		};
	}

	get #csvBoundaries() {
		return new RegExp(`(?<escapedEnclosure>${this.#enclosure}${this.#enclosure})|(?<enclosure>${this.#enclosure})|(?<delimiter>${this.#delimiter})|(?<newline>\r\n|\n|\r)|(?<textdata>[^${this.#enclosure}${this.#delimiter}\r\n]+)`, 'g');
	}

	/**
	 * Parses a CSV string according to RFC 4180 and returns an array-of-arrays that contain the parsed CSV data.
	 * @param {String} csv A CSV string
	 * @returns {Array} Array of records that correspond to the rows of the CSV. Each record is an array containing strings for each column.
	 * @see https://www.rfc-editor.org/rfc/rfc4180
	 */
	parse(csv) {
		this.#csv = typeof csv === 'string' ? csv : '';
		this.#state = this.#newState();
		const csvMatches = Array.from(this.#csv.matchAll(this.#csvBoundaries));

		csvMatches.forEach(match => {
			this.#handleMatch(match);
		});

		this.#finishRecords();

		return this.#state.records;
	}

	/**
	 * Parses a string by CSV & TSV formats and returns the one with the most fields.
	 * @param {String} value A CSV or TSV string
	 * @returns {Array} Array of records as returned by {@link parse()}
	 */
	autoParse(value) {
		const initialOptions = this.#getOptions();

		this.#setOptions({...initialOptions, delimiter: ','});
		const csvRecords = this.parse(value);
		const csvFieldCount = this.#lastFieldCount();

		this.#setOptions({...initialOptions, delimiter: '\t'});
		const tsvRecords = this.parse(value);
		const tsvFieldCount = this.#lastFieldCount();

		this.#setOptions(initialOptions);

		return tsvFieldCount > csvFieldCount ? tsvRecords : csvRecords;
	}

	#lastFieldCount() {
		return this.#state?.fieldCount > 0 ? this.#state.fieldCount : 0;
	}

	#newState() {
		return {
			records: [],
			record: this.#newRecord(),
			field: this.#newField(),
			fieldCount: 0
		};
	}

	#newRecord() {
		return [];
	}

	#newField() {
		return {
			value: '',
			isEnclosed: false,
			isEnclosureEscaped: false
		};
	}

	#handleMatch(match) {
		const value = match.at(0);

		if (this.#state.field.isEnclosed && match.groups.escapedEnclosure) {
			this.#handleEscapedEnclosure();
		}
		else if (match.groups.enclosure) {
			this.#handleEnclosure(value);
		}
		else if (match.groups.delimiter) {
			this.#handleDelimiter(value);
		}
		else if (match.groups.newline) {
			this.#handleNewline(value);
		} else {
			this.#handleTextData(value);
		}
	}

	#handleEscapedEnclosure() {
		this.#appendField(this.#enclosure);
	}

	#handleEnclosure(enclosure) {
		if (!this.#state.field.value.length) {
			this.#state.field.isEnclosed = true;
		}
		else if (this.#state.field.isEnclosed) {
			this.#state.field.isEnclosed = false;
		}
		else if (this.#state.field.isEnclosureEscaped) {
			this.#appendField(enclosure);
			this.#state.field.isEnclosureEscaped = false;
		}
		else {
			this.#state.field.isEnclosureEscaped = true;
		}
	}

	#handleDelimiter(delimiter) {
		if (this.#state.field.isEnclosed) {
			this.#appendField(delimiter);
		} else {
			this.#finishField();
		}
	}

	#handleNewline(newline) {
		if (this.#state.field.isEnclosed) {
			this.#appendField(newline);
		} else {
			this.#finishRecords();
		}
	}

	#handleTextData(textdata) {
		this.#appendField(textdata);
	}

	#appendField(value) {
		this.#state.field.value += value;
	}

	#finishField() {
		const fieldValue = this.#trim ? this.#state.field.value.trim() : this.#state.field.value;
		this.#state.record.push(fieldValue);
		this.#state.field = this.#newField();
		this.#state.fieldCount++;
	}

	#finishRecord() {
		this.#state.records.push(this.#state.record);
		this.#state.record = this.#newRecord();
	}

	#finishRecords() {
		if (this.#state.field.value) {
			this.#finishField();
		}

		if (this.#state.record.length) {
			this.#finishRecord();
		}
	}
}

window.MMX_CSVParser = MMX_CSVParser;