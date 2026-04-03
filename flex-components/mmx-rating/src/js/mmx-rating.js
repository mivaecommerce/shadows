/**
 * MMX / Rating
 */

class MMX_Rating extends MMX_Element {

	static get props() {
		return {
			rating: {
				allowAny: true,
				isNumeric: true,
				default: 0
			},
			count: {
				allowAny: true,
				isNumeric: true,
				default: 0
			},
			'max-rating': {
				allowAny: true,
				default: 5,
				isNumeric: true
			},
			'icon-set': {
				options: [
					'star',
					'heart'
				],
				default: 'star'
			},
			'active-color': {
				allowAny: true
			},
			'inactive-color': {
				allowAny: true
			}
		};
	}

	styleResourceCodes = ['mmx-base', 'mmx-rating'];
	renderUniquely = true;

	constructor() {
		super();
		this.makeShadow();
	}

	render() {
		return /*html*/ `
			<span
				part="wrapper"
				class="mmx-rating"
				title="${MMX.encodeEntities(this.#getReviewRatingTitle())}"
			>
				${this.#renderIconsOverlay()}
				${this.#renderCount()}
			</span>
		`;
	}

	styles() {
		const activeColor = this.getPropValue('active-color');
		const inactiveColor = this.getPropValue('inactive-color');

		return /*css*/ `
			:host {
				${activeColor ? `--mmx-rating__active-color: ${MMX.encodeEntities(activeColor)};` : ''}
				${inactiveColor ? `--mmx-rating__inactive-color: ${MMX.encodeEntities(inactiveColor)};` : ''}
				--mmx-rating__active-percent: ${MMX.encodeEntities(this.#getActiveWidth())};
			}

			[part~="row-active"] {
				width: var(--mmx-rating__active-percent);
			}
		`;
	}

	#getReviewRatingTitle() {
		if (!this.#hasRating()) {
			return 'This product has not been rated';
		}

		const maxRating = this.getPropValue('max-rating');
		const ratingText = this.#getDisplayRatingText();
		const count = this.getPropValue('count');

		let title = `This product has a ${ratingText}/${maxRating} rating`;

		if (count > 0) {
			return `${title} with ${count} ${MMX.pluralize('review', count)}`;
		}

		return title;
	}

	#getDisplayRatingText() {
		const maxRating = this.getPropValue('max-rating');
		let rating = this.getPropValue('rating');

		if (rating > maxRating) {
			rating = maxRating;
		}

		return rating % 1 === 0 ? rating.toString() : rating.toFixed(1);
	}

	#hasRating() {
		return this.getPropValue('rating') > 0;
	}

	#renderCount() {
		const count = this.getPropValue('count');

		if (count <= 0) {
			return '';
		}

		return /*html*/ `<span part="count">(${MMX.encodeEntities(count)})</span>`;
	}

	#getActiveWidth() {
		const rating = this.getPropValue('rating');
		const maxRating = this.getPropValue('max-rating');

		if (rating <= 0 || maxRating <= 0) {
			return 0;
		}

		const percent = (rating / maxRating) * 100;

		return `${Math.max(0, Math.min(100, percent))}%`;
	}

	#renderIconsOverlay() {
		const icon = this.getPropValue('icon-set');
		const fullIcon = `${icon}-full`;
		const emptyIcon = `${icon}-empty`;

		return /*html*/ `
			<span part="track">
				<span part="row row-inactive">
					<mmx-icon part="icon icon-inactive">${emptyIcon}</mmx-icon>
					<mmx-icon part="icon icon-inactive">${emptyIcon}</mmx-icon>
					<mmx-icon part="icon icon-inactive">${emptyIcon}</mmx-icon>
					<mmx-icon part="icon icon-inactive">${emptyIcon}</mmx-icon>
					<mmx-icon part="icon icon-inactive">${emptyIcon}</mmx-icon>
				</span>

				<span part="row row-active">
					<mmx-icon part="icon icon-active">${fullIcon}</mmx-icon>
					<mmx-icon part="icon icon-active">${fullIcon}</mmx-icon>
					<mmx-icon part="icon icon-active">${fullIcon}</mmx-icon>
					<mmx-icon part="icon icon-active">${fullIcon}</mmx-icon>
					<mmx-icon part="icon icon-active">${fullIcon}</mmx-icon>
				</span>
			</span>
		`;
	}
}

if (!customElements.get('mmx-rating')) {
	customElements.define('mmx-rating', MMX_Rating);
}