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
			keys = [],
			config
		} = optionsValue;

		this.scorer = scorer;
		this.config = config;

		if (typeof scorer.createConfig == "function") {
				// let the scorer fill out the config with default values
			this.config = scorer.createConfig(config);
		}

		this.setItems(items);
		this.setKeys(keys);

		this.compareScoredStrings = this.compareScoredStrings.bind(this);
	}


	search(
		query)
	{
		const results = [];
		const {keys, config} = this;

		if (keys.length) {
			for (const item of this.items) {
				const result = {
					item: item,
					scores: {},
					matches: {}
				};
				let highScore = 0;
				let scoreKey = "";

					// find the highest score for each keyed string on this item
				for (const keyInfo of keys) {
					const matches = [];
					const {key} = keyInfo;
					const newScore = keyInfo.scorer(item[key], query, matches, config);

					result.scores[key] = newScore;
					result.matches[key] = matches;

					if (newScore > highScore) {
						highScore = newScore;
						scoreKey = key;
					}
				}

				result.score = highScore;
				result.scoreKey = scoreKey;
				results.push(result);
			}
		} else {
				// items is a flat array of strings
			for (const item of this.items) {
				const matches = [];
				const score = this.scorer(item, query, matches, config);

				results.push({
					item,
					score,
					matches
				});
			}
		}

		results.sort(this.compareScoredStrings);

		return results;
	}


	setKeys(
		keys)
	{
		this.keys = Array.from(keys);

		if (this.keys.length) {
			const {scorer} = this;

				// associate each key with the scorer function, if it isn't already
				/* eslint object-curly-spacing: 0, object-property-newline: 0 */
			this.keys = this.keys.map(key => (
				(typeof key !== "object") ? { key, scorer } : key
			));

			this.defaultKeyName = this.keys[0].key;
		} else {
				// defaultKeyName will be null if items is a flat array of
				// strings, which is handled in compareScoredStrings()
			this.defaultKeyName = null;
		}
	}


	setItems(
		items)
	{
		this.items = items;
	}


	compareScoredStrings(
		a,
		b)
	{
		const itemA = a.item;
		const itemB = b.item;

		if (a.score == b.score) {
			return (itemA[this.defaultKeyName] || itemA).toLocaleLowerCase() <
				(itemB[this.defaultKeyName] || itemB).toLocaleLowerCase() ? -1 : 1;
		} else {
			return b.score - a.score;
		}
	}
}
