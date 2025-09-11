// ===================================================================
// [ 메인 실행 로직 ]
// ===================================================================
// DOM 로드 완료 후 전체 스크립트 초기화 및 실행
document.addEventListener('DOMContentLoaded', () => {
   console.log('DOM이 준비되었어. 스크립트를 실행할게.');

   // 기능별 초기화 함수 호출
   initMobileMenu();
   loadTrendProduct();
   loadInstagramFeed();
   initLookBookGallery();
   setupDesignStoryScroll();
   initFooterAccordion();

   // -------------------------------------------------------------------
   // 사이트 내 모든 a 태그의 기본 동작 방지 (페이지 이동 막음)
   // -------------------------------------------------------------------
   document.addEventListener('click', (e) => {
      const link = e.target.closest('a');

      // a 태그이고 href 속성 값이 '#'이 아닐 경우
      if (link && link.href && link.getAttribute('href') !== '#') {
         e.preventDefault();
         console.log(`'${link.href}' 링크로의 이동을 막았어.`);
      }
   });
});

// ===================================================================
// [ 공용 유틸리티 함수 ]
// ===================================================================

/**
 * @name fetchJSON
 * @description JSON 데이터 비동기 요청 및 반환 함수
 * @param {string} url - 불러올 JSON 파일의 경로
 * @returns {Promise<any>} - 성공 시 JSON 데이터, 실패 시 에러
 */
async function fetchJSON(url) {
   const response = await fetch(url);
   if (!response.ok) {
      throw new Error(`HTTP 에러! 상태: ${response.status}, URL: ${url}`);
   }
   return await response.json();
}

// ===================================================================
// [ 기능별 함수 정의 ]
// ===================================================================

/**
 * @name initMobileMenu
 * @description 모바일 메뉴 토글 기능
 */
function initMobileMenu() {
   const mobileMenuButton = document.querySelector('.mobile-nav-toggle');
   const navMenu = document.querySelector('.main-nav');
   if (mobileMenuButton && navMenu) {
      mobileMenuButton.addEventListener('click', () => {
         navMenu.classList.toggle('active');
         mobileMenuButton.classList.toggle('active');
      });
   }
}

/**
 * @name formatPrice
 * @description 숫자 통화 형식 변환 (세 자리 콤마)
 * @param {string | number} price - 변환할 가격
 * @returns {string} - 포맷팅된 가격 문자열
 */
function formatPrice(price) {
   return Number(price).toLocaleString();
}

/**
 * @name loadTrendProduct
 * @description 트렌드 상품 '더 보기', '간략히 보기' 기능
 */
async function loadTrendProduct() {
   const trendGrid = document.querySelector('.product-grid');
   const viewMoreContainer = document.querySelector(
      '.featured-products .section-footer',
   );

   if (!trendGrid || !viewMoreContainer) {
      console.error('필수 요소(.product-grid 또는 .section-footer)를 못 찾음');
      return;
   }

   try {
      const allTrendData = await fetchJSON('./data/trendData.json');
      const initialItemCount = 4;
      const itemsPerLoad = 4;
      let currentCount = initialItemCount;

      // 상품 카드 HTML 생성 및 렌더링
      const renderProducts = (products) => {
         const newProductsHtml = products
            .map((item) => {
               const discountRate = Math.round(
                  ((item.price - item.discountPrice) / item.price) * 100,
               );
               return `
               <div class="product-card" data-aos="fade-up">
                  <div class="product-image-wrapper">
                     <img src="${item.src}" alt="${item.title}" data-aos="zoom-in" />
                     ${discountRate > 0 ? `<span class="discount-badge">${discountRate}%</span>` : ''}
                  </div>
                  <div class="product-info">
                     <h3 class="product-title">${item.title}</h3>
                     <p class="product-detail">${item.detail}</p>
                     <div class="product-price">
                        ${discountRate > 0 ? `<del class="original-price">₩${formatPrice(item.price)}</del>` : ''}
                        <strong class="sale-price">₩${formatPrice(item.discountPrice)}</strong>
                     </div>
                  </div>
                  <div class="item-actions">
                     <a href="#" class="btn-action btn-view-detail" aria-label="자세히 보기">
                        <img src="./images/icons/favorite.svg" alt="자세히 보기 아이콘" />
                     </a>
                     <a href="#" class="btn-action btn-add-to-cart" aria-label="장바구니 담기">
                        <img src="./images/icons/cart.svg" alt="장바구니 아이콘" />
                     </a>
                  </div>
               </div>`;
            })
            .join('');
         trendGrid.insertAdjacentHTML('beforeend', newProductsHtml);
      };

      // 버튼 텍스트 상태 업데이트 ('더 보기' / '간략히 보기')
      const updateButton = () => {
         const viewMoreBtn =
            viewMoreContainer.querySelector('.section-footer a');
         if (!viewMoreBtn) return;
         if (currentCount >= allTrendData.length) {
            viewMoreBtn.textContent = '간략히 보기';
         } else {
            viewMoreBtn.textContent = '더 보기';
         }
      };

      // 초기 상품 4개 로드
      trendGrid.innerHTML = '';
      const initialItems = allTrendData.slice(0, initialItemCount);
      renderProducts(initialItems);
      updateButton();

      // '더 보기' 버튼 클릭 이벤트 처리
      if (allTrendData.length > initialItemCount) {
         viewMoreContainer.style.display = 'flex';
         const viewMoreBtn =
            viewMoreContainer.querySelector('.section-footer a');
         if (viewMoreBtn) {
            viewMoreBtn.addEventListener('click', (e) => {
               e.preventDefault();
               if (currentCount >= allTrendData.length) {
                  // '간략히 보기' 로직: 상품 목록을 초기 상태로 되돌림
                  currentCount = initialItemCount;
                  trendGrid.innerHTML = '';
                  const newInitialItems = allTrendData.slice(
                     0,
                     initialItemCount,
                  );
                  renderProducts(newInitialItems);
                  updateButton();
                  trendGrid.scrollIntoView({
                     behavior: 'smooth',
                     block: 'start',
                  });
               } else {
                  // '더 보기' 로직: 다음 상품 4개를 추가 로드
                  const nextItems = allTrendData.slice(
                     currentCount,
                     currentCount + itemsPerLoad,
                  );
                  renderProducts(nextItems);
                  currentCount += itemsPerLoad;
                  updateButton();
               }
            });
         }
      } else {
         viewMoreContainer.style.display = 'none';
      }
   } catch (error) {
      console.error('트렌드 인기상품 로딩 중 에러:', error);
      trendGrid.innerHTML = `<p class="error-message">상품을 불러올 수 없어.</p>`;
   }
}

/**
 * @name loadInstagramFeed
 * @description 인스타그램 피드 데이터 로드 및 렌더링
 */
async function loadInstagramFeed() {
   const instarGrid = document.querySelector('.instar-grid');
   if (!instarGrid) return;
   try {
      const feedData = await fetchJSON('./data/instagram-feed.json');
      const feedHtml = feedData
         .map(
            (item) => `
         <div class="instar-item">
            <a href="#" class="instar-link">
               <div class="instar-image-wrapper">
                  <img class="instar-image" src="${item.imageUrl}" alt="${item.hashtag} 인스타그램 피드 이미지">
                  <div class="instar-image-overlay">
                     <div class="instar-stats">
                        <span class="likes">❤️ ${item.likes}</span>
                        <span class="comments">💬 ${item.comments}</span>
                     </div>
                  </div>
               </div>
               <div class="instar-info">
                  <div class="instar-profile">
                     <img class="profile-image" src="${item.profileImage}" alt="${item.userId} 프로필 이미지">
                     <span class="user-id">${item.userId}</span>
                  </div>
                  <span class="hashtag">${item.hashtag}</span>
               </div>
            </a>
         </div>`,
         )
         .join('');
      instarGrid.innerHTML = feedHtml;
   } catch (error) {
      console.error('인스타그램 피드 로딩 오류:', error);
      instarGrid.innerHTML = `<p class="error-message">피드를 불러올 수 없어.</p>`;
   }
}

/**
 * @name initFooterAccordion
 * @description 모바일 푸터 아코디언 기능
 */
function initFooterAccordion() {
   const toggles = document.querySelectorAll('.footer-toggle');
   toggles.forEach((toggle) => {
      toggle.addEventListener('click', () => {
         // 768px 이상 데스크탑 환경에서는 작동 안 함
         if (window.innerWidth >= 768) {
            return;
         }
         const column = toggle.parentElement;
         column.classList.toggle('active');
      });
   });
}

/**
 * @name initLookBookGallery
 * @description Isotope.js 라이브러리 활용 갤러리 필터링
 */
async function initLookBookGallery() {
   const $gallery = $('.showroom__gallery');
   const $filter = $('.showroom__filter');
   if (!$gallery.length) return;
   try {
      const galleryData = await fetchJSON('./data/galleryData.json');
      // JSON 데이터 기반으로 갤러리 아이템 HTML 동적 생성
      const galleryHtml = galleryData
         .map((item) => {
            let priceHtml = '';
            if (item.price && item.discountPrice) {
               const discountRate = Math.round(
                  ((item.price - item.discountPrice) / item.price) * 100,
               );
               priceHtml = `
               <div class="product-price">
                  ${discountRate > 0 ? `<del class="original-price">₩${formatPrice(item.price)}</del>` : ''}
                  <strong class="sale-price">₩${formatPrice(item.discountPrice)}</strong>
               </div>`;
            }
            return `
            <div class="showroom__gallery-item ${item.category}">
               <img src="${item.src}" alt="${item.title}">
               <div class="item-overlay">
                  <div class="product-info">
                     <h3 class="product-title">${item.title}</h3>
                     <p class="product-detail">${item.detail || ''}</p>
                     ${priceHtml}
                  </div>
                  <div class="item-actions">
                     <a href="#" class="btn-action btn-view-detail" aria-label="자세히 보기">
                        <img src="./images/icons/search.svg" alt="자세히 보기 아이콘" />
                     </a>
                     <a href="#" class="btn-action btn-add-to-cart" aria-label="장바구니 담기">
                        <img src="./images/icons/cart.svg" alt="장바구니 아이콘" />
                     </a>
                  </div>
               </div>
            </div>`;
         })
         .join('');
      $gallery.html(galleryHtml);
      // Isotope 라이브러리 초기화
      $gallery.imagesLoaded(() => {
         $gallery.isotope({
            itemSelector: '.showroom__gallery-item',
            layoutMode: 'masonry',
            filter: '.living-room', // 초기 필터 값
            transitionDuration: '0.5s',
         });
      });
      // 필터 버튼 클릭 시 해당 카테고리 필터링
      $filter.on('click', 'li', function () {
         $gallery.isotope({ filter: $(this).attr('data-filter') });
         $filter.find('li').removeClass('--active');
         $(this).addClass('--active');
      });
   } catch (error) {
      console.error('룩북 갤러리 초기화 중 에러:', error);
      $gallery.html('<p class="error-message">갤러리를 불러올 수 없어.</p>');
   }
}

/**
 * @name setupDesignStoryScroll
 * @description 스크롤 연동 스토리 섹션 애니메이션
 */
async function setupDesignStoryScroll() {
   const storySection = document.querySelector('#design-stories');
   if (!storySection) return;

   const scrollContainer = document.querySelector('.story-scroll-container');
   const slides = document.querySelectorAll('.story-slide');
   const storyTitle = document.getElementById('story-title');
   const storyDescription = document.getElementById('story-description');
   const storyContent = document.querySelector('.story-content');
   const storyDetailButton = storyContent.querySelector('.btn');
   const storyModal = document.getElementById('storyDetailModal');

   if (
      !scrollContainer ||
      slides.length === 0 ||
      !storyTitle ||
      !storyDescription ||
      !storyDetailButton
   ) {
      return;
   }
   const modalContent = storyModal
      ? storyModal.querySelector('.modal-content')
      : null;

   try {
      const storyData = await fetchJSON('./data/design-stories.json');
      // 초기 텍스트 설정
      if (storyData.length > 0) {
         storyTitle.textContent = storyData[0].title;
         storyDescription.innerHTML = `<h3>${storyData[0].headline}</h3><p class="overview">${storyData[0].overview}</p>`;
         storyDetailButton.href = storyData[0].links.shop_category;
      }

      let ticking = false;
      let currentActiveIndex = 0;

      // 스크롤 위치에 따른 애니메이션 처리 함수
      const handleScrollAnimation = () => {
         const containerRect = scrollContainer.getBoundingClientRect();
         const viewportHeight = window.innerHeight;
         // 섹션이 뷰포트 내에서 스크롤될 때만 애니메이션 실행
         const isAnimating =
            containerRect.top <= 0 && containerRect.bottom >= viewportHeight;
         if (isAnimating) {
            const scrollableDistance = containerRect.height - viewportHeight;
            const scrollProgress = Math.max(
               0,
               Math.min(1, -containerRect.top / scrollableDistance),
            );
            let activeIndex = Math.floor(
               scrollProgress * (slides.length - 0.001),
            );
            // 활성 슬라이드 변경 시 텍스트 콘텐츠 업데이트
            if (activeIndex !== currentActiveIndex && storyData[activeIndex]) {
               currentActiveIndex = activeIndex;
               storyContent.style.opacity = 0;
               setTimeout(() => {
                  storyTitle.textContent = storyData[activeIndex].title;
                  storyDescription.innerHTML = `<h3>${storyData[activeIndex].headline}</h3><p class="overview">${storyData[activeIndex].overview}</p>`;
                  storyDetailButton.href =
                     storyData[activeIndex].links.shop_category;
                  storyContent.style.opacity = 1;
               }, 300);
            }
            // 모든 슬라이드의 스타일(transform, opacity) 업데이트
            slides.forEach((slide, index) => {
               slide.classList.remove('is-active', 'is-previous');
               if (index === activeIndex) {
                  // 활성 슬라이드
                  slide.classList.add('is-active');
                  slide.style.transform = 'translateY(0) scale(1)';
                  slide.style.opacity = 1;
               } else if (index < activeIndex) {
                  // 지나간 슬라이드
                  slide.classList.add('is-previous');
                  const distance = activeIndex - index;
                  const offset = distance * 40;
                  const scale = 1 - distance * 0.05;
                  slide.style.transform = `translateY(-${offset}px) scale(${scale})`;
                  slide.style.opacity = Math.max(0, 0.6 - distance * 0.2);
               } else {
                  // 대기 중인 슬라이드
                  slide.style.transform = 'translateY(50px) scale(0.95)';
                  slide.style.opacity = 0;
               }
            });
         }
      };

      // 스크롤 이벤트 최적화 (requestAnimationFrame 사용)
      window.addEventListener('scroll', () => {
         if (!ticking) {
            window.requestAnimationFrame(() => {
               handleScrollAnimation();
               ticking = false;
            });
            ticking = true;
         }
      });

      // 상세 정보 모달 기능
      if (storyModal && modalContent) {
         // 모달 열기
         function openStoryModal(data) {
            const featuresHtml = data.features
               .map(
                  (f) =>
                     `<div class="feature-item"><h4>${f.name}</h4><p class="tech-stack"><strong>Keywords:</strong> ${f.tech.join(', ')}</p><p class="feature-desc">${f.desc}</p></div>`,
               )
               .join('');
            const linkHtml = data.links.shop_category
               ? `<a href="${data.links.shop_category}" class="link-shop">Shop This Category</a>`
               : '';
            modalContent.innerHTML = `<button class="modal-close-btn">&times;</button><h2>${data.title}</h2><p class="overview">${data.overview}</p><hr>${featuresHtml}<div class="modal-links">${linkHtml}</div>`;
            storyModal.classList.add('visible');
            modalContent
               .querySelector('.modal-close-btn')
               .addEventListener('click', closeStoryModal);
         }
         // 모달 닫기
         function closeStoryModal() {
            storyModal.classList.remove('visible');
         }
         storyModal.addEventListener('click', (e) => {
            if (e.target === storyModal) closeStoryModal();
         });
         // '자세히 보기' 버튼 클릭 시 모달 열기
         storyDetailButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (storyData[currentActiveIndex]) {
               openStoryModal(storyData[currentActiveIndex]);
            }
         });
         // 활성화된 슬라이드 이미지 클릭 시 모달 열기
         const storyVisuals = document.querySelector('.story-visuals');
         storyVisuals.addEventListener('click', (e) => {
            const clickedSlide = e.target.closest('.story-slide.is-active');
            if (clickedSlide && storyData[currentActiveIndex]) {
               openStoryModal(storyData[currentActiveIndex]);
            }
         });
      }
   } catch (error) {
      console.error('Design Stories 애니메이션 설정 중 에러:', error);
   }
}
