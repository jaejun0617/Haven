// ===================================================================
// [ 메인 실행 로직 ]
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
   console.log('DOM이 준비되었습니다. 스크립트를 실행합니다.');

   initMobileMenu();
   loadInstagramFeed();
   initLookBookGallery();
});

// ===================================================================
// [ 공용 유틸리티 함수 ]
// ===================================================================

/**
 * 지정된 URL에서 JSON 데이터를 비동기적으로 가져오는 범용 함수
 * @param {string} url - 불러올 JSON 파일의 경로
 * @returns {Promise<any>} - 성공 시 파싱된 JSON 데이터, 실패 시 에러를 던짐
 */
async function fetchJSON(url) {
   const response = await fetch(url);
   if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} for URL: ${url}`);
   }
   return await response.json();
}

// ===================================================================
// [ 기능별 함수 정의 ]
// ===================================================================

function initMobileMenu() {
   const mobileMenuButton = document.querySelector('.mobile-nav-toggle');
   const navMenu = document.querySelector('.main-nav');

   if (mobileMenuButton && navMenu) {
      mobileMenuButton.addEventListener('click', () => {
         navMenu.classList.toggle('active');
         mobileMenuButton.classList.toggle('active');
      });
   } else {
      console.error(
         '모바일 메뉴 버튼 또는 네비게이션 메뉴를 찾을 수 없습니다.',
      );
   }
}

async function loadInstagramFeed() {
   const instarGrid = document.querySelector('.instar-grid');
   if (!instarGrid) return;

   try {
      const feedData = await fetchJSON('../data/instagram-feed.json');

      const feedItemsHTML = feedData
         .map(
            (item) => `
            <a href="#" class="instar-item" data-aos="fade-up">
                <img src="${item.imageUrl}" alt="인스타그램 피드 이미지"> <br>
                <span class="hashtag">${item.hashtag}</span>
                <div class="instar-item__overlay">
                    <span class="likes">❤️ ${item.likes}</span>
                    <span class="comments">💬 ${item.comments}</span>
                </div>
            </a>
        `,
         )
         .join('');

      instarGrid.innerHTML = feedItemsHTML;
   } catch (error) {
      console.error(
         '인스타그램 피드를 불러오는 중 오류가 발생했습니다:',
         error,
      );
      instarGrid.innerHTML = `<div class="error-message"><p>피드를 불러오는 데 실패했습니다.</p></div>`;
   }
}

async function initLookBookGallery() {
   const $gallery = $('.showroom__gallery');
   const $filter = $('.showroom__filter');
   if (!$gallery.length) return;

   try {
      const galleryData = await fetchJSON('../data/galleryData.json');

      const galleryItemsHTML = galleryData
         .map(
            (item) => `
            <div class="showroom__gallery-item ${item.category}">
                <img src="${item.src}" alt="${item.title}">
                <div class="item-overlay">${item.title}</div>
            </div>
        `,
         )
         .join('');

      $gallery.html(galleryItemsHTML);

      $gallery.imagesLoaded(function () {
         $gallery.isotope({
            itemSelector: '.showroom__gallery-item',
            layoutMode: 'masonry',
            transitionDuration: '0.5s',
            filter: '.living-room',
         });
      });

      $filter.on('click', 'li', function () {
         const filterValue = $(this).attr('data-filter');
         $gallery.isotope({ filter: filterValue });
         $filter.find('li').removeClass('--active');
         $(this).addClass('--active');
      });
   } catch (error) {
      console.error('룩북 갤러리를 초기화하는 중 오류가 발생했습니다:', error);
      $gallery.html(
         '<p class="error-message">갤러리를 불러올 수 없습니다.</p>',
      );
   }
}
