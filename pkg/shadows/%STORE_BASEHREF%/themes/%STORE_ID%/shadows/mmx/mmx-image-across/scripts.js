/**
 * MMX / IMAGE ACROSS
 */
class MMX_ImageAcross extends MMX_Element {
	#auto_image_height;

	static get props() {
		return {
			align: {
				options: [
					'left',
					'center',
					'right'
				],
				default: 'center'
			},
			size: {
				options: [
					'auto',
					's',
					'm',
					'l'
				],
				allowAny: true,
				default: 'auto'
			},
			images: {
				allowAny: true,
				default: null
			},
			columns: {
				options: [
					'auto',
					'1',
					'2',
					'3',
					'4',
					'5',
					'6',
					'7',
					'8'
				],
				allowAny: true,
				default: 'auto',
				max: 8
			},
			overflow: {
				options: [
					'scroll',
					'wrap'
				],
				default: 'scroll'
			}
		};
	}

	themeResourcePattern = /mmx-(base|button|hero|image-across)\/styles.css|family=Inter/i;

	constructor() {
		super();
		this.makeShadow();
	}

	render() {
		return /*html*/`
			<div part="wrapper" class="mmx-image-across">
				<div part="title" class="mmx-image-across__title">
					<slot name="title"></slot>
				</div>
				<div part="images" class="mmx-image-across__images mmx-image-across__images-columns--${this.maxColumns()} mmx-image-across__images-overflow--${this.getPropValue('overflow')}">
					${this.renderImages()}
					<slot name="image"></slot>
				</div>
			</div>
		`;
	}

	afterRender() {
		this.setImageHeight();
	}

	styles() {
		return /*css*/`
			:host {
				--mmx-image-across__text-align: ${this.getPropValue('align')};
				--mmx-image-across__columns: ${this.maxColumns()};
				--mmx-image-across__image-count: ${this.getImageCount()};
			}
		`;
	}

	images() {
		return this.loadPropertyData('images') || [];
	}

	slottedImages() {
		return this.querySelectorAll(':scope > [slot="image"]');
	}

	shadowImages() {
		return this.shadowRoot.querySelectorAll('[part="image"]');
	}

	imageElements() {
		return [...this.shadowImages(), ...this.slottedImages()];
	}

	renderImages() {
		return this.images().map((image => {
			return this.createElement({
				type: 'mmx-hero',
				attributes: {
					part: 'image',
					...image
				}
			}).outerHTML;
		})).join('');
	}

	getImageCount() {
		const slottedImageCount = this.slottedImages().length;
		return this.images().length + slottedImageCount;
	}

	maxColumns() {
		const columns = this.getPropValue('columns');

		if (columns !== 'auto') {
			return isNaN(columns) ? columns : Number(columns);
		}

		const imageCount = this.getImageCount();
		if (imageCount < this.constructor.props.columns.max) {
			return imageCount;
		}

		return this.constructor.props.columns.max;
	}

	setImageHeight() {
		if (this.getPropValue('size') !== 'auto') {
			return this.updateImageHeight(this.getPropValue('size'));
		}

		this.#auto_image_height = 0;

		this.imageElements().forEach(image => {
			const img = image?.slottedImage?.() ?? image?.shadowImage?.();

			if (img?.complete) {
				return this.checkLoadedImage(img);
			}

			image.addEventListener('img:load', this.#event_image_load);
		});
	}

	#event_image_load = (e) => {
		this.checkLoadedImage(e.detail.element);
	};

	checkLoadedImage(image) {
		const last_auto_image_height = this.#auto_image_height;

		this.calculateMinImageHeight(this.getResponsiveImageHeight(image));

		if (last_auto_image_height !== this.#auto_image_height) {
			this.updateImageHeight(this.#auto_image_height + 'px');
		}
	}

	updateImageHeight(size) {
		this.imageElements().forEach(image => {
			image.setAttribute('data-size', size);
		});
	}

	calculateMinImageHeight(height)
	{
		if (this.#auto_image_height === 0) {
			this.#auto_image_height = height;
		}
		else if (height < this.#auto_image_height) {
			this.#auto_image_height = height;
		}
	}
}

if (!customElements.get('mmx-image-across')){
	customElements.define('mmx-image-across', MMX_ImageAcross);
}
