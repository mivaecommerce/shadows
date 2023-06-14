/**
 * MMX / HERO SLIDER
 */
class MMX_HeroSlider extends MMX_Element {
	#current_slide;
	#resize_observer;
	#auto_image_height;
	#intersection_observer;
	#calculated_image_height;

	static get props() {
		return {
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
			delay: {
				isNumeric: true,
				allowAny: true,
				default: 5
			},
			autoplay: {
				isBoolean: true,
				default: true
			},
			'pause-on-hover': {
				isBoolean: true,
				default: true
			},
			slides: {
				allowAny: true,
				default: null
			},
			'per-page': {
				allowAny: true,
				default: '1,1,1'
			},
			'per-move': {
				isNumeric: true,
				allowAny: true,
				default: 'auto'
			},
			wrap: {
				isBoolean: true,
				default: true
			},
			peek: {
				isNumeric: true,
				allowAny: true,
				default: 75
			},
			gap: {
				isNumeric: true,
				allowAny: true,
				default: 16
			},
			'nav-position': {
				options: [
					'under',
					'over',
					'none'
				],
				default: 'over'
			},
			'arrow-style': {
				options: [
					'caret',
					'button',
					'none'
				],
				default: 'caret'
			},
			'nav-style': {
				options: [
					'normal',
					'minimal',
					'none'
				],
				default: 'normal'
			},
			'sync-heights': {
				allowAny: true,
				default: ''
			}
		};
	}

	themeResourcePattern = /mmx-(base|button|hero|hero-slider)\/styles.css|family=Inter/i;

	constructor() {
		super();

		this.#current_slide			= 0;
		this.#resize_observer		= new ResizeObserver(entries => this.calculateImageHeight());
		this.#intersection_observer	= new IntersectionObserver(entries => {
			if (!entries[0].isIntersecting) {
				return;
			}

			this.slideElements().forEach(slide => {
				const img = slide?.slottedImage?.() ?? slide?.shadowImage?.();

				if (img) {
					img.setAttribute('loading', 'eager');
					img.setAttribute('fetchpriority', 'high');
				}
			});

			this.updateSizing();
			this.#intersection_observer.disconnect();
		});

		this.makeShadow();
	}

	connected() {
		window.addEventListener('resize', this.#event_window_resize);
	}

	#event_window_resize = (e) => {
		this.updateSizing()
	}

	updateSizing() {
		const slides = this.slideElements();

		slides.forEach(slide => {
			slide.classList.add('notransition');
		});

		this.setImageHeight();
		this.calculateImageHeight();
		this.syncHeights();
		this.updateArrows();
		this.updateSliderNavigation();
		this.moveToSlide(this.currentSlide());

		slides.forEach(slide => {
			slide.offsetHeight; // trigger reflow
			slide.classList.remove('notransition');
		});
	}

	render() {
		return /*html*/`
			<div part="wrapper" class="mmx-hero-slider mmx-hero-slider--arrow-style-${this.getPropValue('arrow-style')} mmx-hero-slider--per-page-${this.getCurrentPerPage()}">
				<div part="slides" class="mmx-hero-slider__slides">
					${this.renderSlides()}
					<slot name="hero_slide"></slot>
				</div>
				<button class="mmx-hero-slider__arrow-left" title="Move to previous slider page">${this.renderSliderArrowSVG()}</button>
				<button class="mmx-hero-slider__arrow-right" title="Move to next slider page">${this.renderSliderArrowSVG()}</button>
				<div class="mmx-hero-slider__slider-navigation mmx-hero-slider__slider-navigation--position-${this.getPropValue('nav-position')} mmx-hero-slider__slider-navigation--style-${this.getPropValue('nav-style')}"></div>
			</div>
		`;
	}

	renderSliderArrowSVG() {
		switch (this.getPropValue('arrow-style')) {
			case 'caret':	return this.renderSliderArrowSVGCaret();
			case 'button':	return this.renderSliderArrowSVGButton();
			default:		return '';
		}
	}

	renderSliderArrowSVGCaret() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="32.641" viewBox="0 0 20 32.641">
			<path class="mmx-hero-slider__arrow-inner" d="M3.415,15.732l-.218.218.218.22L17.441,30.237l.01-.01,1.733-1.754-1.739-1.744L6.7,15.951,17.489,5.127l1.74-1.745L17.495,1.628l-.007-.007Z" transform="translate(0.771 0.391)" />
			<path class="mmx-hero-slider__arrow-outer" d="M16.268,0,14.517,1.759.265,16.075,0,16.342H0L14.472,30.882l1.751,1.759.01-.01,1.98-2L4.186,16.56l-.218-.218.218-.218L18.259,2.012l-1.983-2Z" transform="translate(0 0)" />
		</svg>`;
	}

	renderSliderArrowSVGButton() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="7.197" height="11.831" viewBox="0 0 7.197 11.831">
			<path class="mmx-hero-slider__arrow-button" d="M1.31,0,0,1.3,5.916,7.2l5.916-5.9L10.521,0,5.916,4.606Z" transform="translate(7.197) rotate(90)" />
		</svg>`;
	}

	styles() {
		const perPageBreakpoints = this.getPerPageBreakpoints();
		return /*css*/`
			:host {
				--mmx-hero-slider__per-page--mobile: ${perPageBreakpoints.mobile};
				--mmx-hero-slider__per-page--tablet: ${perPageBreakpoints.tablet};
				--mmx-hero-slider__per-page--desktop: ${perPageBreakpoints.desktop};
			}
		`;
	}

	afterRender() {
		this.#intersection_observer.observe(this);
		this.updateSizing();
		this.bindEvents();
	}

	bindEvents() {
		this.bindSlides();
		this.bindAutoPlay();
		this.bindSwipe();
	}

	// Swipe

	#event_swipe_start = (e) => {
		this.startSwipe(e);
	}

	#event_swipe_finish = (e) => {
		this.finishSwipe(e);
	}

	bindSlides() {
		const slides = this.slideElements();

		slides.forEach(slide => {
			if (!slide.__mmx_resize_bound) {
				slide.__mmx_resize_bound = true;
				this.#resize_observer.observe(slide);
			}
		});
	}

	bindSwipe() {
		this.startX = null;

		['mousedown', 'touchstart'].forEach(type => this.addEventListener(type, this.#event_swipe_start, { passive: true }));
		['mouseup', 'touchend'].forEach(type => this.addEventListener(type, this.#event_swipe_finish, { passive: true }));
	}

	startSwipe(e) {
		e.stopImmediatePropagation();
		this.startX = this.getEventPosition(e);
	}

	finishSwipe(e) {
		e.stopImmediatePropagation();

		const swipeTheshold = 20;

		if (this.startX === null) {
			return;
		}

		const finishX = this.getEventPosition(e);

		const swipeDistance = this.startX - finishX;
		this.startX = null;

		if (Math.abs(swipeDistance) < swipeTheshold) {
			return;
		}

		if (swipeDistance > 0) {
			this.moveToNext();
		}
		else if (swipeDistance < 0) {
			this.moveToPrev();
		}
	}

	getEventPosition(e, position = 'X') {
		const prop = `client${position}`;
		return e?.[prop] ?? e?.changedTouches?.[0]?.[prop];
	}

	// Navigation

	#event_navigation_move_prev_click = (e) => {
		this.moveToPrev();
	}

	#event_navigation_move_next_click = (e) => {
		this.moveToNext();
	}

	#event_navigation_move_position_click = (e) => {
		if (e?.currentTarget.hasOwnProperty('__mmx_item_position')) {
			this.moveToPage(e.currentTarget.__mmx_item_position);
			return false;
		}
	};

	bindNavigation() {
		var navigation_left, navigation_right;

		if (navigation_left = this.navigationLeftElement())		navigation_left.addEventListener('click', this.#event_navigation_move_prev_click);
		if (navigation_right = this.navigationRightElement())	navigation_right.addEventListener('click', this.#event_navigation_move_next_click);

		[...this.navigationSliderElements()].forEach((navigation_item, i) => {
			this.bindNavigationSlide(navigation_item, i);
		});
	}

	bindNavigationSlide(item, position) {
		item.__mmx_item_position = position;
		item.addEventListener('click', this.#event_navigation_move_position_click);
	}

	// Autoplay

	#interval_id;
	#autoplay_focus;
	#autoplay_running;
	#autoplay_mouseover;

	#event_mouseover_stop_autoplay = (e) => {
		this.#autoplay_mouseover = true;
		this.requestStopAutoplay();
	}

	#event_mouseout_start_autoplay = (e) => {
		this.#autoplay_mouseover = false;
		this.requestStartAutoplay();
	}

	#event_focusin_stop_autoplay = (e) => {
		this.#autoplay_focus = true;
		this.requestStopAutoplay();
	}

	#event_focusout_start_autoplay = (e) => {
		this.#autoplay_focus = false;
		this.requestStartAutoplay();
	}

	bindAutoPlay() {
		this.stopAutoplay();

		this.removeEventListener('mouseover',	this.#event_mouseover_stop_autoplay);
		this.removeEventListener('mouseout',	this.#event_mouseout_start_autoplay);
		this.removeEventListener('focusin',		this.#event_focusin_stop_autoplay);
		this.removeEventListener('focusout',	this.#event_focusout_start_autoplay);

		if (this.getPropValue('autoplay')) {
			this.startAutoplay();

			if (this.getPropValue('pause-on-hover')) {
				this.addEventListener('mouseover',	this.#event_mouseover_stop_autoplay);
				this.addEventListener('mouseout',	this.#event_mouseout_start_autoplay);
				this.addEventListener('focusin',	this.#event_focusin_stop_autoplay);
				this.addEventListener('focusout',	this.#event_focusout_start_autoplay);
			}
		}
	}

	requestStopAutoplay() {
		if (!this.getPropValue('autoplay') || this.#autoplay_focus || this.#autoplay_mouseover) {
			this.stopAutoplay();
		}
	};

	stopAutoplay() {
		if (!this.#autoplay_running) {
			return;
		}

		this.#autoplay_running = false;
		clearInterval(this.#interval_id);
	};

	requestStartAutoplay() {
		if (this.getPropValue('autoplay') && !this.#autoplay_focus && !this.#autoplay_mouseover) {
			this.startAutoplay();
		}
	};

	startAutoplay() {
		if (this.#autoplay_running) {
			return;
		}

		this.#autoplay_running	= true;
		this.#interval_id		= setInterval(() => {
			this.moveToNext();
		}, this.getDelayInMilliseconds());
	};

	getDelayInMilliseconds() {
		return this.getPropValue('delay') * 1000;
	}

	// Move to First/Last

	moveToFirstSlide() {
		return this.moveToSlide(0);
	}

	moveToLastSlide() {
		return this.moveToSlide(this.getSlideCount() - 1);
	}

	moveToFirstPage() {
		return this.moveToPage(0);
	}

	moveToLastPage() {
		return this.moveToPage(this.getPageCount() - 1);
	}

	// Move to Next/Prev

	moveToNextSlide() {
		return this.moveToSlide(this.currentSlide() + 1);
	}

	moveToPrevSlide() {
		return this.moveToSlide(this.currentSlide() - 1);
	}

	moveToNextPage() {
		return this.moveToPage(this.currentPage() + 1);
	}

	moveToPrevPage() {
		return this.moveToPage(this.currentPage() - 1);
	}

	moveToNext() {
		const slideCount = this.getSlideCount();
		const lastSlideIsVisible = this.currentSlide() + this.getCurrentPerPage() >= slideCount;

		// If wrapping and the last slide is visible, go to the first slide
		if (this.getPropValue('wrap') && lastSlideIsVisible) {
			return this.moveToFirstSlide();
		}

		// If the next position is out of range, go to the last slide
		const nextSlidePosition = this.currentSlide() + this.getPerMoveAmount();
		if (nextSlidePosition > slideCount) {
			this.moveToSlide(slideCount);
		}

		// Otherwise, go to normal next position
		return this.moveToSlide(nextSlidePosition);
	}

	moveToPrev() {
		const firstSlideIsVisible = this.currentSlide() === 0;

		// If wrapping and the first slide is visible, go to the first slide of the last page
		if (this.getPropValue('wrap') && firstSlideIsVisible) {
			return this.moveToSlide(this.getSlideCount() - this.getCurrentPerPage());
		}

		// If the prev position is out of range, go to the first slide
		const prevSlidePosition = this.currentSlide() - this.getPerMoveAmount();
		if (prevSlidePosition <= 0) {
			return this.moveToSlide(0);
		}

		// Otherwise, if the
		return this.moveToSlide(prevSlidePosition);
	}

	// Move to Position

	moveToPage(position) {
		position = isNaN(position) ? 0 : position;
		return this.moveToSlide(position * this.getCurrentPerPage());
	}

	moveToSlide(position) {
		this.#current_slide = isNaN(position) ? 0 : position;
		const state = this.getSliderState();

		// Don't move if we don't have slides
		if (state.slideCount === 0) {
			return;
		}

		if (this.getPropValue('wrap')) {
			// Wrap to first/last slide when provided an out of range location
			if (position < 0) {
				return this.moveToLastSlide();
			}
			else if (position >= state.slideCount) {
				return this.moveToFirstSlide();
			}
		} else {
			// Stay on first/last slide when provided an out of range location
			if (position < 0) {
				return this.moveToFirstSlide();
			}
			else if (position >= state.slideCount) {
				return this.moveToLastSlide();
			}
		}

		// Update each slide
		state.slides.forEach((slide, i) => {
			const isOnPage = this.slideIndexIsOnPage(i, state);
			slide.hidden = !isOnPage;
			slide.setAttribute('tabindex', isOnPage ? '' : -1);
			slide.style.width = state.slideWidth;
			slide.style.transform = state.slideTransform;
			slide.style.paddingLeft = state.slidePaddingLeft;
		});

		// Update the selected nav item
		[...this.navigationSliderElements()].forEach((navItem, i) => {
			if (i === this.currentPage())  {
				return navItem.classList.add('selected');
			}

			return navItem.classList.remove('selected');
		});

		this.updateArrows();

		return position;
	}

	getSliderState() {
		const state = {};

		state.position = this.#current_slide;

		state.slides = this.slideElements();
		state.slideCount = state.slides?.length ?? 0;
		state.perPage = this.getCurrentPerPage();

		state.maxPosition = state.slideCount - state.perPage;
		state.moveToPosition = Math.min(state.maxPosition, state.position);

		state.onFirstPage = state.position <= 0;
		state.onLastPage = state.position + state.perPage >= state.slideCount;
		state.hasMultiplePages = state.slideCount > state.perPage;

		state.gap = state.perPage > 1 ? this.getPropValue('gap') : 0;
		state.peek = state.hasMultiplePages && state.perPage > 1 ? this.getPropValue('peek') + state.gap : 0;

		state.totalGap = (state.perPage - 1) * state.gap;
		state.slideWidth = (this.clientWidth - state.peek + state.gap) / state.perPage;
		state.translateX = state.hasMultiplePages ? ((0 - state.moveToPosition) * state.slideWidth) - state.gap : -1 * state.gap;

		// Create peek on left side
		if (state.onLastPage && state.hasMultiplePages) {
			state.translateX += state.peek;
		}

		state.slideWidth = state.slideWidth + 'px';
		state.slideTransform = 'translateX(' + state.translateX + 'px)';
		state.slidePaddingLeft = state.gap + 'px';

		return state;
	}

	slideIndexIsOnPage(i, state) {
		return i >= state.moveToPosition && i <= state.moveToPosition + state.perPage - 1;
	}

	currentSlide() {
		return this.#current_slide;
	}

	currentPage() {
		const currentPage = Math.floor((this.currentSlide()) / this.getCurrentPerPage());
		return currentPage;
	}

	getCurrentPerPage() {
		return this.getPerPageBreakpoints().current;
	}

	getPerMoveAmount() {
		const perMove = this.getPropValue('per-move');
		return perMove > 0 ? perMove : this.getCurrentPerPage();
	}

	getPerPageBreakpoints() {
		const perPages = this.getPropValue('per-page');

		let [mobile, tablet, desktop] = perPages.split(',').map(perPage => {
			return MMX.coerceNumber(perPage, 1);
		});

		mobile = MMX.coerceNumber(mobile, 1);
		tablet = MMX.coerceNumber(tablet, mobile);
		desktop = MMX.coerceNumber(desktop, mobile);

		let current = this.sliderElement() ? window.getComputedStyle(this.sliderElement()).getPropertyValue('--mmx-hero-slider__per-page') : mobile;

		return {
			current: MMX.coerceNumber(current, mobile),
			mobile,
			tablet,
			desktop
		};
	}

	sliderElement() {
		return this.shadowRoot.querySelector('.mmx-hero-slider');
	}

	slides() {
		return this.loadPropertyData('slides') || [];
	}

	slottedSlides() {
		return this.querySelectorAll(':scope > [slot="hero_slide"]');
	}

	shadowSlides() {
		return this.shadowRoot.querySelectorAll('mmx-hero');
	}

	navigationLeftElement() {
		return this.shadowRoot.querySelector('.mmx-hero-slider__arrow-left');
	}

	navigationRightElement() {
		return this.shadowRoot.querySelector('.mmx-hero-slider__arrow-right');
	}

	navigationSliderElement() {
		return this.shadowRoot.querySelector('.mmx-hero-slider__slider-navigation');
	}

	navigationSliderElements() {
		return this.shadowRoot.querySelectorAll('.mmx-hero-slider__slider-navigation > button');
	}

	slideElements() {
		return [...this.shadowSlides(), ...this.slottedSlides()];
	}

	renderSlides() {
		return this.slides().map((slide => {
			return this.createElement({
				type: 'mmx-hero',
				attributes: slide
			}).outerHTML;
		})).join('');
	}

	updateArrows() {
		const pageCount = this.getPageCount();
		const state = this.getSliderState();
		const leftArrow = this.navigationLeftElement();
		const rightArrow = this.navigationRightElement();

		// Show/Hide Arrows Depending on pageCount
		if (pageCount > 1) {
			leftArrow.style.display = '';
			rightArrow.style.display = '';
		}
		else {
			leftArrow.style.display = 'none';
			rightArrow.style.display = 'none';
		}

		if (this.getPropValue('wrap')) {
			return;
		}

		// Enabled/Disable Arrows Depending on if we're on the last/first page
		if (state.onFirstPage) {
			leftArrow.disabled = true;
		} else {
			leftArrow.disabled = false;
		}

		if (state.onLastPage) {
			rightArrow.disabled = true;
		} else {
			rightArrow.disabled = false;
		}
	}

	updateSliderNavigation() {
		const pageCount = this.getPageCount();
		const sliderNavigation = this.navigationSliderElement();

		if (!(pageCount > 1)) {
			return sliderNavigation.style.display = 'none';
		}

		sliderNavigation.style.display = '';

		sliderNavigation.innerHTML = Array.from(Array(pageCount)).map(((page, i) => {
			return this.createElement({
				type: 'button',
				attributes: {
					title: `Move slider to page #${i + 1}`
				}
			}).outerHTML;
		})).join('');

		this.bindNavigation();
	}

	getSlideCount() {
		const slottedSlideCount = this.slottedSlides().length;
		return this.slides().length + slottedSlideCount;
	}

	getPageCount() {
		return Math.ceil(this.getSlideCount() / this.getCurrentPerPage());
	}

	#event_slide_image_load = (e) => {
		this.checkLoadedImage(e.detail.element);
	}

	setImageHeight() {
		const slides = this.slideElements();

		if (this.getPropValue('size') !== 'auto') {
			return this.updateSlideHeight(this.getPropValue('size'));
		}

		this.#auto_image_height = 0;

		slides.forEach(slide => {
			const img = slide?.slottedImage?.() ?? slide?.shadowImage?.();

			if (img?.complete) {
				return this.checkLoadedImage(img);
			}

			slide.addEventListener('img:load', this.#event_slide_image_load);
		});
	}

	calculateImageHeight() {
		const slides = this.slideElements();

		this.#calculated_image_height = 0;

		slides.forEach(slide => {
			var img, rect;

			if (((typeof slide.slottedImage === 'function') && (img = slide.slottedImage())) ||
				((typeof slide.shadowImage === 'function') && (img = slide.shadowImage()))) {
				rect = img.getBoundingClientRect();

				if (this.#calculated_image_height === 0) {
					this.#calculated_image_height = rect.height;
				}
				else if (rect.height < this.#calculated_image_height) {
					this.#calculated_image_height = rect.height;
				}
			}
		});

		this.updateNavigationPositions();
	}

	checkLoadedImage(image) {
		const last_auto_image_height = this.#auto_image_height;

		this.calculateMinImageHeight(this.getResponsiveImageHeight(image));

		if (last_auto_image_height !== this.#auto_image_height) {
			this.updateSlideHeight(this.#auto_image_height + 'px');
		}
	}

	updateSlideHeight(size) {
		this.slideElements().forEach(slide => {
			slide.setAttribute('data-size', size);
		});

		this.calculateImageHeight();
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

	updateNavigationPositions() {
		var navigation_left, navigation_right;

		if (navigation_left = this.navigationLeftElement()) {
			navigation_left.style.top = (this.#calculated_image_height / 2) + 'px';
		}

		if (navigation_right = this.navigationRightElement()) {
			navigation_right.style.top = (this.#calculated_image_height / 2) + 'px';
		}
	}

	syncHeights() {
		const selectors = this.getPropValue('sync-heights');

		if (typeof selectors !== 'string' || !selectors.length) {
			return;
		}

		const slides = this.slideElements();

		selectors.split(',').forEach(selector => {
			const elements = [];
			let maxHeight = 0;

			slides.forEach(slide => {
				[...slide.querySelectorAll(selector)].forEach(element => {
					element.style.height = '';

					if (element.clientHeight > maxHeight) {
						maxHeight = element.clientHeight;
					}

					elements.push(element);
				});
			});

			elements.forEach(element => {
				element.style.height = maxHeight > 0 ? maxHeight + 'px' : '';
			});
		});
	}
}

if (!customElements.get('mmx-hero-slider')) {
	customElements.define('mmx-hero-slider', MMX_HeroSlider);
}
