/**
 * MMX / TAB LIST
 */
class MMX_Tabs extends MMX_Element {

	static get props() {
		return {};
	}

	styleResourceCodes = ['mmx-base', 'mmx-tabs'];
	renderUniquely = true;

	static instance = 0;
	#instance;
	#originalId;
	#id;
	#desktopBreakpoint = window.matchMedia('(min-width: 60em)');

	constructor() {
		super();
		this.makeShadow();
		this.#initialize();
		this.#bindComponentEvents();
	}

	#initialize() {
		MMX_Tabs.instance += 1;

		this.#instance = MMX_Tabs.instance;
		this.#originalId = this.getAttribute('id');
		this.#id = this.#originalId ?? `${this.nodeName.toLowerCase()}-${this.#instance}`;
	}

	// Rendering
	render() {
		return /*html*/`
			<div part="wrapper" class="mmx-tabs">
				${this.#desktopBreakpoint.matches ? this.#renderDesktopLayout() : this.#renderMobileLayout()}
			</div>
		`;
	}

	#renderDesktopLayout() {
		this.#tabs().forEach(tab => {
			tab.setAttribute('slot', 'tab');
		});

		this.#tabPanels().forEach(tabPanel => {
			tabPanel.setAttribute('slot', 'tab-panel');
		});

		return /*html*/`
			<slot name="tab"></slot>
			<slot name="tab-panel"></slot>
		`;
	}

	#renderMobileLayout() {
		this.#tabs().forEach(tab => {
			tab.removeAttribute('slot');
		});

		this.#tabPanels().forEach(tabPanel => {
			tabPanel.removeAttribute('slot');
		});

		return /*html*/`
			<slot></slot>
		`;
	}

	afterRender() {
		this.#identifyElements();
		this.#setSelectedTab();
	}

	#identifyElements() {
		const tabPanels = Array.from(this.#tabPanels());

		this.setAttribute('id', this.#id);

		Array.from(this.#tabs()).forEach((tab, i) => {
			const tabPanel = tabPanels.at(i);
			const tabId = `${this.#id}__tab-${i+1}`;
			const panelId = `${this.#id}__tab-panel-${i+1}`;

			tab.id = tabId;
			tab.setAttribute('data-controls', panelId);

			tabPanel?.setAttribute?.('data-labelledby', tabId);
		});
	}

	// Events
	#bindComponentEvents() {
		this.addEventListener('keydown', (e) => {
			this.#onKeyDown(e);
		});

		this.#desktopBreakpoint.addEventListener('change', () => {
			this.#onDesktopBreakpointChange();
		});

		this.addEventListener('tab:selected', (e) => {
			this.#setSelectedTab(e?.detail?.tab);
		});
	}

	#onKeyDown(e) {
		const targetedTabIndex = Array.from(this.#tabs()).findIndex(tab => tab === e.target);

		if (targetedTabIndex === -1) {
			return;
		}

		if ([' ', 'Enter'].includes(e.key)) {
			this.#selectTabAtIndex(targetedTabIndex);
			e.preventDefault();
		}
		else if (this.#desktopBreakpoint.matches) {
			if (e.key === 'ArrowRight') {
				e.preventDefault();
				this.#selectNextTab();
			}
			else if (e.key === 'ArrowLeft') {
				e.preventDefault();
				this.#selectPreviousTab();
			}
		}
		else {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				this.#selectNextTab();
			}
			else if (e.key === 'ArrowUp') {
				e.preventDefault();
				this.#selectPreviousTab();
			}
		}
	}

	#onDesktopBreakpointChange() {
		this.forceUpdate();
	}

	// Methods
	#setSelectedTab(selectedTab = this.#selectedTab()) {
		const tabPanels = Array.from(this.#tabPanels());

		Array.from(this.#tabs()).forEach((tab, i) => {
			const isSelected = tab === selectedTab;
			const tabPanel = tabPanels.at(i);

			tab.setAttribute('data-selected', isSelected);

			if (isSelected) {
				tabPanel.removeAttribute('hidden');
			} else {
				tabPanel.setAttribute('hidden', '');
			}
		});
	}

	#selectNextTab() {
		this.#selectTabAtIndex(this.#currentTabIndex() + 1);
	}

	#selectPreviousTab() {
		this.#selectTabAtIndex(this.#currentTabIndex() - 1);
	}

	#currentTabIndex() {
		const selectedTab = this.#selectedTab();
		return Array.from(this.#tabs()).findIndex(tab => tab === selectedTab);
	}

	#selectTabAtIndex(index = 0) {
		const lastIndex = this.#tabs().length - 1;

		if (index < 0) {
			index = lastIndex;
		}
		else if (index > lastIndex) {
			index = 0;
		}

		const tab = Array.from(this.#tabs()).at(index);
		this.#selectTab(tab);
	}

	#selectTab(tab) {
		this.#setSelectedTab(tab);
		tab.focus();
		tab.scrollIntoView({
			behavior: 'smooth'
		});
	}

	// Elements
	#tabs() {
		return this.querySelectorAll(':scope > mmx-tab');
	}

	#tabPanels() {
		return this.querySelectorAll(':scope > mmx-tab-panel');
	}

	#selectedTab() {
		return this.querySelector(':scope > mmx-tab[data-selected="true"]') ?? this.querySelector(':scope > mmx-tab');
	}
}

if (!customElements.get('mmx-tabs')){
	customElements.define('mmx-tabs', MMX_Tabs);
}

/**
 * MMX / TAB
 */
class MMX_Tab extends MMX_Element {

	static get props() {
		return {};
	}

	styleResourceCodes = ['mmx-base', 'mmx-tabs'];
	renderUniquely = true;

	constructor() {
		super();
		this.makeShadow();
		this.#bindComponentEvents();
	}

	// Rendering
	render() {
		return /*html*/`
			<button part="wrapper" typ="button" class="mmx-tab" tabindex="-1">
				<slot></slot>
			</button>
		`;
	}

	afterRender() {
		this.setAttribute('tabindex', this.hasAttribute('data-selected') ? 0 : -1);
	}

	// Events
	#bindComponentEvents() {
		this.addEventListener('click', () => {
			this.#notifyTabSelected();
		});
	}

	#notifyTabSelected() {
		this.dispatchEvent(new CustomEvent('tab:selected', {
			bubbles: true,
			composed: true,
			detail: {
				tab: this
			}
		}));
	}
}

if (!customElements.get('mmx-tab')){
	customElements.define('mmx-tab', MMX_Tab);
}

/**
 * MMX / TAB PANEL
 */
class MMX_TabPanel extends MMX_Element {

	static get props() {
		return {};
	}

	styleResourceCodes = ['mmx-base', 'mmx-tabs'];
	renderUniquely = true;

	constructor() {
		super();
		this.makeShadow();
	}

	render() {
		return /*html*/`
			<div part="wrapper" class="mmx-tab-panel">
				<slot></slot>
			</div>
		`;
	}
}

if (!customElements.get('mmx-tab-panel')){
	customElements.define('mmx-tab-panel', MMX_TabPanel);
}