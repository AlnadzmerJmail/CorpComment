// ---------------GLOBAL---------------
const BASE_API_URL = 'https://bytegrad.com/course-assets/js/1/api';

const textAreaEl = document.querySelector('.form__textarea');
const counterEl = document.querySelector('.counter');
const formEl = document.querySelector('.form');
const feedbackListEl = document.querySelector('.feedbacks');
const submitBtnEl = document.querySelector('.submit-btn');
const spinnerEl = document.querySelector('.spinner');
const hashtagListEl = document.querySelector('.hashtags');

const state = {
	data: [],
	filter: '',
};

const insertFeedback = ({
	upvoteCount,
	badgeLetter,
	company,
	text,
	daysAgo,
}) => {
	const feedbackItemHTML = `
				<li class="feedback">
					<button class="upvote">
						<i class="fa-solid fa-caret-up upvote__icon"></i>
						<span class="upvote__count">${upvoteCount}</span>
					</button>
					<section class="feedback__badge">
						<p class="feedback__letter">${badgeLetter}</p>
					</section>
					<div class="feedback__content">
						<p class="feedback__company">${company}</p>
						<p class="feedback__text">${text}</p>
					</div>
					<p class="feedback__date">${daysAgo > 0 ? `${daysAgo}d` : 'NEW'}</p>
				</li>
                `;
	// add item
	feedbackListEl.insertAdjacentHTML('beforeend', feedbackItemHTML);
};

const insertError = (err = {}) => {
	feedbackListEl.textContent = `Failed to fetch items. Error message: ${
		err.message || 'Unknow'
	}`;
};

// ---------------COUNTER---------------
const charsMaxLength = counterEl?.textContent || 150;

const inputHandler = (e) => {
	const charsLength = e.target.value.length;

	if (charsLength > charsMaxLength) return;

	counterEl.textContent = charsMaxLength - charsLength;
};

textAreaEl.addEventListener('input', inputHandler);

// ---------------FORM---------------
const showVisualIndicator = (className) => {
	className = `form--${className}`;

	formEl.classList.add(className);

	setTimeout(() => {
		formEl.classList.remove(className);
	}, 2000);
};

const formSubmitHandler = (e) => {
	e.preventDefault();

	// const text = e.target.feedback.value
	const text = textAreaEl.value;

	// hashtag and text length validation
	if (text.includes('#') && text.length >= 5) {
		showVisualIndicator('valid');
	} else {
		showVisualIndicator('invalid');

		return textAreaEl.focus();
	}

	// extract the word that has a hashtag symbol
	const hashtagWord = text.split(' ').find((word) => word.includes('#'));

	const company = hashtagWord.slice(1);

	// first letter of the hashtag word
	const badgeLetter = hashtagWord.slice(1, 2)?.toUpperCase();

	const upvoteCount = 0;
	const daysAgo = 0;

	// new feedback item
	const feedbackItem = {
		upvoteCount,
		badgeLetter,
		company,
		text,
		daysAgo,
	};

	// send feedback to the server
	fetch(`${BASE_API_URL}/feedbacks`, {
		method: 'POST',
		body: JSON.stringify(feedbackItem), // convert to json format
		headers: {
			Accept: 'application/json', // indicating that we prefe to accept json for the response of this request
			'Content-Type': 'application/json', // indicating that we are sending json file format
		},
	})
		.then((res) => {
			if (res.ok) {
				state.data.push(feedbackItem);
				insertFeedback(feedbackItem);
			} else alert('Something went wrong!');
		})
		.catch((err) => alert(err.message || 'Something went wrong!'));

	// clear textarea
	textAreaEl.value = '';

	submitBtnEl.blur();

	counterEl.textContent = charsMaxLength;
};

formEl.addEventListener('submit', formSubmitHandler);

// ------------------------------------------------------------FEEDBACK LIST------------------------------------------------------------
const feedbackClickHandler = (e) => {
	const clickedEl = e.target;

	const isUpvote = clickedEl.className.includes('upvote');

	if (isUpvote) {
		const upvoteBtnEl = clickedEl.closest('.upvote');
		upvoteBtnEl.disabled = true;

		// select upvote count element  within the upvoteBtnEl
		const upvoteCountEl = upvoteBtnEl.querySelector('.upvote__count');
		upvoteCountEl.textContent = +upvoteCountEl.textContent + 1;
	} else {
		// select the nearest/closest feedback element and add or remove class 'feedback--expand'
		// closest() -- will only works for finding parent element
		clickedEl.closest('.feedback')?.classList.toggle('feedback--expand');
	}
};

feedbackListEl.addEventListener('click', feedbackClickHandler); // event delegation -- because the click will actually triggered in feedbackList item

fetch(`${BASE_API_URL}/feedbacks`)
	.then((res) => {
		if (res.ok) return res.json();

		insertError({ message: 'Server Error' });
	})
	.then((data) => {
		spinnerEl.remove();

		if (data?.feedbacks[0]) {
			state.data = data.feedbacks;
			data.feedbacks.forEach((feedback) => insertFeedback(feedback));
		}
	})
	.catch((err) => insertError(err));

// ------------------------------------------------------------HASHTAG LIST------------------------------------------------------------
(() => {
	const clickHandler = (e) => {
		const clickedEl = e.target;

		if (clickedEl.className !== 'hashtag') return;

		const clickedCompanyName = clickedEl.textContent
			.slice(1)
			.toLowerCase()
			.trim();

		feedbackListEl.innerHTML = '';

		const displayData = state.data.filter(
			({ company }) => company.toLowerCase() === clickedCompanyName
		);
		displayData.forEach((feedback) => insertFeedback(feedback));

		// feedbackListEl.childNodes.forEach((childNode) => {
		// 	// stop if it is text node
		// 	if (childNode.nodeType === 3) return;

		// 	const companyEl = childNode.querySelector('.feedback__company');

		// 	if (companyEl.textContent.toLowerCase().trim() !== clickedCompanyName)
		// 		childNode.remove();
		// });
	};
	hashtagListEl.addEventListener('click', clickHandler);
})();
