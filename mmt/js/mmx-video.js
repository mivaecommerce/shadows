/**
 * MMX / VIDEO
 */
class MMX_Video extends MMX_Hero {

	static get props() {
		return MMX.assign(MMX_Video.videoProps, MMX_Hero.props);
	}

	static videoProps = {
		'video': {
			allowAny: true,
			default: null
		},
		'autoplay': {
			isBoolean: true,
			default: true
		},
		'muted': {
			isBoolean: true,
			default: true
		},
		'loop': {
			isBoolean: true,
			default: true
		},
		'controls': {
			isBoolean: true,
			default: false
		},
		'start': {
			isNumeric: true,
			allowAny: true,
			default: 0
		}
	};

	sizeToRatioMap = {
		s: '1440 / 520',
		m: '1440 / 648',
		l: '1440 / 810'
	};

	constructor() {
		super();
	}

	renderImage() {
		if (this.slottedImage()) {
			return '';
		}

		return this.renderVideo();
	}

	renderVideo() {
		// Validate we have a video
		const videoUrl = this.getPropValue('video');

		if (!videoUrl) {
			return '';
		}

		this.provider = this.videoProviders.find(provider => {
			return provider?.match(videoUrl);
		});

		return this.provider?.render(videoUrl, {
			autoplay: this.getPropValue('autoplay'),
			loop: this.getPropValue('loop'),
			muted: this.getPropValue('muted'),
			controls: this.getPropValue('controls'),
			start: this.getPropValue('start')
		});
	}

	youtubeProvider = {
		pattern: /youtu?.be.*(?:\/|%3D|v=|vi=)([0-9A-z-_]{11})/,
		match(url) {
			const matches = String(url).match(this.pattern);
			return matches ? matches[1] : null;
		},
		render(url, options) {
			const videoId = this.match(url);

			if (!videoId) {
				return '';
			}

			// https://developers.google.com/youtube/player_parameters
			// https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=XtayETPXD2k&format=json
			const defaultEmbedParameters = 'playsinline=1&rel=0&disablekb=0&modestbranding=1';
			const autoplay = options?.autoplay ? 'autoplay=1' : 'autoplay=0';
			const loop = options?.loop ? `playlist=${videoId}&loop=1`: 'loop=0';
			const muted = options?.muted ? 'mute=1' : 'mute=0';
			const controls = options?.controls ? 'controls=1' : 'controls=0';
			const embedUrl = `https://www.youtube.com/embed/${videoId}?${defaultEmbedParameters}&${controls}&${autoplay}&${muted}&${loop}&start=${options?.start}`;

			return /*html*/`
				<iframe part="video" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;" allowfullscreen></iframe>
			`;
		}
	};

	vimeoProvider = {
		pattern: /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\\/]*)\/videos\/|video\/|)(\d+)/,
		match(url) {
			const matches = String(url).match(this.pattern);
			return matches ? matches[1] : null;
		},
		render(url, options) {
			const videoId = this.match(url);

			if (!videoId) {
				return '';
			}

			// https://vimeo.zendesk.com/hc/en-us/articles/115011183028
			// https://vimeo.zendesk.com/hc/en-us/articles/360000121668-Start-playback-at-a-specific-timecode
			// https://vimeo.com/api/oembed.json?url=https://player.vimeo.com/video/759640679
			// https://github.com/vimeo/vimeo-oembed-examples/blob/master/oembed/js-example.html
			const autoplay = options?.autoplay ? 'autoplay=1' : 'autoplay=0';
			const loop = options?.loop ? 'loop=1' : 'loop=0';
			const muted = options?.muted ? 'muted=1' : 'muted=0';
			const controls = options?.controls ? 'background=0' : 'background=1';
			const embedUrl = `https://player.vimeo.com/video/${videoId}?playsinline=1${loop}&${autoplay}&${controls}&${muted}#t=${options?.start}`;

			return /*html*/`
				<iframe part="video" src="${embedUrl}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
			`;
		}
	};

	htmlProvider = {
		match() {
			return true;
		},
		render(url, options) {
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
			// https://www.w3.org/TR/media-frags/#media-fragment-syntax
			const autoplay = options?.autoplay ? 'autoplay' : '';
			const loop = options?.loop ? 'loop' : '';
			const muted = options?.muted ? 'muted' : '';
			const controls = options?.controls ? 'controls' : '';
			const embedUrl = `${url}#t=${options?.start}`;

			return /*html*/`
				<video part="video" playsinline ${autoplay} ${loop} ${muted} ${controls}>
					<source src="${embedUrl}">
				</video>
			`;
		}
	};

	videoProviders = [
		this.youtubeProvider,
		this.vimeoProvider,
		this.htmlProvider // Should be last as it always renders
	];
}

if (!customElements.get('mmx-video')) {
	customElements.define('mmx-video', MMX_Video);
}
