var navbarItems = document.getElementsByClassName('navbar-item');

for (var i = 0; i < navbarItems.length; i++) {
	navbarItems[i].addEventListener('click', navbarItemClick);
}

function navbarItemClick(event) {
	var sectionToGo = this.getElementsByTagName("a")[0].href.split("#");

	if (sectionToGo.length > 1) {
		event.preventDefault();
		var goTo = sectionToGo[sectionToGo.length - 1];
		var elementToGo;
		if (goTo == '') {
			elementToGo = document.getElementsByClassName('header')[0];
		} else {
			elementToGo = document.getElementById(goTo);
		}
		scrollToElement(elementToGo);
	}
}

function scrollToElement(element) {
	var jump = parseInt(element.getBoundingClientRect().top * 0.3);
	if (jump != 0) {
		document.body.scrollTop += jump;

		if (!element.lastJump || element.lastJump > Math.abs(jump)) {
			element.lastJump = Math.abs(jump);
			setTimeout(function() {
				scrollToElement(element);
			}, 60);
		} else {
			document.body.scrollTop += element.getBoundingClientRect().top;
			element.lastJump = null;
		}		
	}
}

window.addEventListener("scroll", changeMenuStyle);

function changeMenuStyle(event) {
	// console.log(document.body.scrollTop, document.getElementsByClassName('header')[0].getBoundingClientRect().top);
}
