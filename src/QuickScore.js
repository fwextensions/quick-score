/* eslint object-curly-spacing: 0, object-property-newline: 0 */

import {quickScore} from "./quick-score";


export default class QuickScore {
	constructor(
		items = [],
		options = {})
	{
		let optionsValue = options;

		if (options instanceof Array) {
			optionsValue = { keys: options };
		}

		const {
			scorer = quickScore,
			keys = ["string"],
			config
		} = optionsValue;

		this.scorer = scorer;
		this.config = config;

		if (typeof scorer.createConfig == "function") {
			this.config = scorer.createConfig(config);
		}

			// setting the keys will also initialize the items
		this.items = items;
		this.setKeys(keys);

		this.compareScoredStrings = this.compareScoredStrings.bind(this);
	}


	search(
		query)
	{
		for (const item of this.items) {
			let highScore = 0;
			let scoreKey = "";

				// find the highest score for each keyed string on this item
			for (const keyInfo of this.keys) {
				const matches = [];
				const {key} = keyInfo;
				const newScore = keyInfo.scorer(item[key], query, matches, this.config);

				item.scores[key] = newScore;
				item.matches[key] = matches;

				if (newScore > highScore) {
					highScore = newScore;
					scoreKey = key;
				}
			}

			item.score = highScore;
			item.scoreKey = scoreKey;
		}

		this.items.sort(this.compareScoredStrings);

		return this.items;
	}


	setKeys(
		keys)
	{
		const {scorer} = this;

			// associate each key with the score function, if it isn't already
		this.keys = Array.from(keys).map(key => (
			(typeof key !== "object") ? { key, scorer } : key
		));
		this.defaultKeyName = this.keys[0].key;

			// delete the scores property of each item and then call setItems()
			// so that the keys get updated
		for (const item of this.items) {
			delete item.scores;
		}

		this.setItems(this.items);
	}


	setItems(
		items)
	{
		if (items.length && !items[0].scores) {
			this.items = items.map(itemValue => {
				let item = itemValue;

				if (typeof item == "string") {
					item = {
						[this.defaultKeyName]: item
					};
				}

				item.score = 0;
				item.scoreKey = "";
				item.scores = {};
				item.matches = {};

				for (const keyInfo of this.keys) {
					item.scores[keyInfo.key] = 0;
					item.matches[keyInfo.key] = [];
				}

				return item;
			});
		} else {
			this.items = items;
		}
	}


	compareScoredStrings(
		a,
		b)
	{
		if (a.score == b.score) {
			return a[this.defaultKeyName].toLocaleLowerCase() < b[this.defaultKeyName].toLocaleLowerCase() ? -1 : 1;
		} else {
			return b.score - a.score;
		}
	}
}
