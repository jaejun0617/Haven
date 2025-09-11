// ===================================================================
// [ 메인 실행 로직 ]
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
   console.log('DOM이 준비되었어. 스크립트를 실행할게.');

   // 각 기능별 초기화 함수 호출
   initMobileMenu();
   loadTrendProduct();
   // formatPrice(); // 이 함수는 다른 함수 내부에서 사용되므로 여기서 직접 호출할 필요 없어.
   loadInstagramFeed();
   initLookBookGallery();
   setupDesignStoryScroll();
   initFooterAccordion();
});

// ===================================================================
// [ 공용 유틸리티 함수 ]
// ===================================================================

/**
 * @name fetchJSON
 * @description 지정된 URL에서 JSON 데이터를 비동기적으로 가져오는 함수야.
 * @param {string} url - 불러올 JSON 파일의 경로
 * @returns {Promise<any>} - 성공하면 파싱된 JSON 데이터, 실패하면 에러를 던짐.
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
 * @description 모바일 환경에서 메뉴 버튼 클릭하면 네비게이션을 토글하는 기능.
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
 * @description 숫자를 통화 형식(세 자리마다 콤마)으로 바꿔주는 함수.
 * @param {string | number} price - 변환할 가격
 * @returns {string} - 포맷팅된 가격 문자열 (예: "2,500,000")
 */
function formatPrice(price) {
   return Number(price).toLocaleString();
}

/**
 * @name loadTrendProduct
 * @description 트렌드 인기상품을 4개씩 점진적으로 로드하고, 다 보여주면 '닫기' 기능으로 전환.
 */
async function loadTrendProduct() {
   const trendGrid = document.querySelector('.product-grid');
   const viewMoreContainer = document.querySelector(
      '.featured-products .section-footer',
   );

   if (!trendGrid || !viewMoreContainer) {
      console.error(
         '필수 요소(.product-grid 또는 .section-footer)를 못 찾았어.',
      );
      return;
   }

   try {
      const allTrendData = await fetchJSON('./data/trendData.json');

      const initialItemCount = 4; // 처음에 보여줄 상품 개수
      const itemsPerLoad = 4; // "더 보기" 클릭할 때마다 추가할 상품 개수
      let currentCount = initialItemCount; // 현재 화면에 보이는 상품 총 개수

      // 상품 데이터를 HTML로 만들어서 렌더링하는 함수
      const renderProducts = (products) => {
         // innerHTML 대신 insertAdjacentHTML을 써서 기존 콘텐츠는 냅두고 추가만 해.
         // 이렇게 하면 "더 보기" 눌렀을 때 화면 깜빡임 없이 부드럽게 추가돼.
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

      // 버튼 상태랑 텍스트 업데이트하는 함수
      const updateButton = () => {
         const viewMoreBtn =
            viewMoreContainer.querySelector('.section-footer a');
         if (!viewMoreBtn) return;

         // 현재 보여준 상품 개수가 전체 개수보다 많거나 같아지면
         if (currentCount >= allTrendData.length) {
            viewMoreBtn.textContent = '간략히 보기'; // "닫기" 기능으로 전환
         } else {
            viewMoreBtn.textContent = '더 보기'; // "더 보기" 기능 유지
         }
      };

      // --- 초기 로드 ---
      trendGrid.innerHTML = ''; // 시작하기 전에 컨테이너를 한번 비워주고.
      const initialItems = allTrendData.slice(0, initialItemCount);
      renderProducts(initialItems);
      updateButton();

      // --- 이벤트 리스너 설정 ---
      if (allTrendData.length > initialItemCount) {
         viewMoreContainer.style.display = 'flex'; // 보여줄 상품 더 있으면 버튼 보이기

         const viewMoreBtn =
            viewMoreContainer.querySelector('.section-footer a');
         if (viewMoreBtn) {
            viewMoreBtn.addEventListener('click', (e) => {
               e.preventDefault();

               // 현재 "간략히 보기"(닫기) 상태일 때
               if (currentCount >= allTrendData.length) {
                  currentCount = initialItemCount; // 보여줄 개수를 초기값으로 리셋
                  trendGrid.innerHTML = ''; // 목록을 싹 비움
                  const newInitialItems = allTrendData.slice(
                     0,
                     initialItemCount,
                  );
                  renderProducts(newInitialItems); // 초기 아이템만 다시 렌더링
                  updateButton(); // 버튼 상태 업데이트

                  // 페이지 상단으로 부드럽게 스크롤 (사용자 경험 향상)
                  trendGrid.scrollIntoView({
                     behavior: 'smooth',
                     block: 'start',
                  });
               }
               // "더 보기" 상태일 때
               else {
                  const nextItems = allTrendData.slice(
                     currentCount,
                     currentCount + itemsPerLoad,
                  );
                  renderProducts(nextItems); // 다음 4개 아이템 추가 렌더링
                  currentCount += itemsPerLoad; // 현재 보여준 개수 업데이트
                  updateButton(); // 버튼 상태 업데이트
               }
            });
         }
      } else {
         // 더 보여줄 상품이 없으면 버튼을 아예 숨겨버림
         viewMoreContainer.style.display = 'none';
      }
   } catch (error) {
      console.error('트렌드 인기상품 로딩 중 에러:', error);
      trendGrid.innerHTML = `<p class="error-message">상품을 불러올 수 없어.</p>`;
   }
}

/**
 * @name loadInstagramFeed
 * @description 인스타그램 피드 데이터를 로드하여 실제 게시물 느낌으로 화면에 표시합니다.
 */
async function loadInstagramFeed() {
   const instarGrid = document.querySelector('.instar-grid');
   if (!instarGrid) return;

   try {
      const feedData = await fetchJSON('./data/instagram-feed.json');

      const feedHtml = feedData
         .map(
            (item) => `
         <div class="instar-item" >
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
         </div>
      `,
         )
         .join('');

      instarGrid.innerHTML = feedHtml;
   } catch (error) {
      console.error('인스타그램 피드 로딩 오류:', error);
      instarGrid.innerHTML = `<p class="error-message">피드를 불러올 수 없습니다.</p>`;
   }
}

/**
 * @name initFooterAccordion
 * @description 모바일 환경에서 푸터의 아코디언 메뉴 기능을 초기화합니다.
 */
function initFooterAccordion() {
   const toggles = document.querySelectorAll('.footer-toggle');

   toggles.forEach((toggle) => {
      toggle.addEventListener('click', () => {
         // 화면이 768px 이상이면 아코디언 기능을 비활성화
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
 * @description Isotope.js를 사용하여 필터링 되는 룩북 갤러리를 만드는 함수.
 *              - 오버레이에 가격, 상세 정보 및 액션 버튼(자세히 보기, 장바구니)을 포함하도록 수정.
 */
async function initLookBookGallery() {
   const $gallery = $('.showroom__gallery');
   const $filter = $('.showroom__filter');
   if (!$gallery.length) return;

   try {
      const galleryData = await fetchJSON('./data/galleryData.json');

      const galleryHtml = galleryData
         .map((item) => {
            let discountRate = 0;
            let priceHtml = '';

            if (item.price && item.discountPrice) {
               discountRate = Math.round(
                  ((item.price - item.discountPrice) / item.price) * 100,
               );
               priceHtml = `
               <div class="product-price">
                  ${discountRate > 0 ? `<del class="original-price">₩${formatPrice(item.price)}</del>` : ''}
                  <strong class="sale-price">₩${formatPrice(item.discountPrice)}</strong>
               </div>
            `;
            }

            // [수정] return 구문 내부에 .item-actions 버튼 그룹 추가
            return `
            <div class="showroom__gallery-item ${item.category}">
               <img src="${item.src}" alt="${item.title}">
               <div class="item-overlay">
                  <div class="product-info">
                     <h3 class="product-title">${item.title}</h3>
                     <p class="product-detail">${item.detail || ''}</p>
                     ${priceHtml}
                  </div>
                  <!-- 🔹 버튼 그룹 시작 🔹 -->
                  <div class="item-actions">
                     <a href="#" class="btn-action btn-view-detail" aria-label="자세히 보기">
                        <img src="./images/icons/search.svg" alt="자세히 보기 아이콘" />
                     </a>
                     <a href="#" class="btn-action btn-add-to-cart" aria-label="장바구니 담기">
                        <img src="./images/icons/cart.svg" alt="장바구니 아이콘" />
                     </a>
                  </div>
                  <!-- 🔹 버튼 그룹 끝 🔹 -->
               </div>
            </div>
         `;
         })
         .join('');

      $gallery.html(galleryHtml);

      $gallery.imagesLoaded(() => {
         $gallery.isotope({
            itemSelector: '.showroom__gallery-item',

            filter: '.living-room',
            transitionDuration: '0.5s',
         });
      });

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
 * @description 스크롤에 따라 브랜드 스토리가 전환되는 인터랙티브 섹션 설정.
 *              - 스티키 스크롤로 이미지/텍스트 전환 애니메이션
 *              - 현재 보이는 스토리에 대한 상세 정보 모달창 기능
 *              - '자세히 보기' 버튼 링크 동적 변경 및 모달 트리거
 */
async function setupDesignStoryScroll() {
   const storySection = document.querySelector('#design-stories');
   if (!storySection) return;

   // 애니메이션이랑 모달에 필요한 HTML 요소들 미리 찾아놓기
   const scrollContainer = document.querySelector('.story-scroll-container');
   const slides = document.querySelectorAll('.story-slide');
   const storyTitle = document.getElementById('story-title');
   const storyDescription = document.getElementById('story-description');
   const storyContent = document.querySelector('.story-content');
   const storyDetailButton = storyContent.querySelector('.btn'); // '자세히 보기' 버튼
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
      // 가구 카테고리별 스토리가 담긴 JSON 데이터 로드
      const storyData = await fetchJSON('./data/design-stories.json');

      if (storyData.length > 0) {
         storyTitle.textContent = storyData[0].title;
         storyDescription.innerHTML = `<h3>${storyData[0].headline}</h3><p class="overview">${storyData[0].overview}</p>`;
         storyDetailButton.href = storyData[0].links.shop_category; // 초기 버튼 링크 설정
      }

      // 스크롤 이벤트 최적화를 위한 'ticking' 플래그 변수
      let ticking = false;
      let currentActiveIndex = 0; // 현재 활성화된 슬라이드 인덱스 추적

      // 스크롤 위치에 따라 실제 애니메이션을 처리하는 함수
      const handleScrollAnimation = () => {
         const containerRect = scrollContainer.getBoundingClientRect();
         const viewportHeight = window.innerHeight;
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

            // 활성화된 슬라이드가 바뀔 때만 내용 업데이트
            if (activeIndex !== currentActiveIndex && storyData[activeIndex]) {
               currentActiveIndex = activeIndex; // 현재 인덱스 업데이트
               storyContent.style.opacity = 0;
               setTimeout(() => {
                  storyTitle.textContent = storyData[activeIndex].title;
                  storyDescription.innerHTML = `<h3>${storyData[activeIndex].headline}</h3><p class="overview">${storyData[activeIndex].overview}</p>`;
                  storyDetailButton.href =
                     storyData[activeIndex].links.shop_category; // 버튼 링크 동적 변경
                  storyContent.style.opacity = 1;
               }, 300);
            }

            // 모든 슬라이드의 시각적 상태(위치, 투명도) 업데이트
            slides.forEach((slide, index) => {
               slide.classList.remove('is-active', 'is-previous');
               if (index === activeIndex) {
                  slide.classList.add('is-active');
                  slide.style.transform = 'translateY(0) scale(1)';
                  slide.style.opacity = 1;
               } else if (index < activeIndex) {
                  slide.classList.add('is-previous');
                  const distance = activeIndex - index;
                  const offset = distance * 40;
                  const scale = 1 - distance * 0.05;
                  slide.style.transform = `translateY(-${offset}px) scale(${scale})`;
                  slide.style.opacity = Math.max(0, 0.6 - distance * 0.2);
               } else {
                  slide.style.transform = 'translateY(50px) scale(0.95)';
                  slide.style.opacity = 0;
               }
            });
         }
      };

      // 스크롤 이벤트를 requestAnimationFrame으로 감싸서 성능 최적화
      window.addEventListener('scroll', () => {
         if (!ticking) {
            window.requestAnimationFrame(() => {
               handleScrollAnimation();
               ticking = false;
            });
            ticking = true;
         }
      });

      // 모달창 관련 기능 (모달 요소가 HTML에 있을 때만 활성화)
      if (storyModal && modalContent) {
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

         function closeStoryModal() {
            storyModal.classList.remove('visible');
         }

         storyModal.addEventListener('click', (e) => {
            if (e.target === storyModal) closeStoryModal();
         });

         // '자세히 보기' 버튼 누르면 모달창 열기
         storyDetailButton.addEventListener('click', (e) => {
            e.preventDefault(); // 기본 링크 이동 막기
            if (storyData[currentActiveIndex]) {
               openStoryModal(storyData[currentActiveIndex]);
            }
         });

         // 이미지(오른쪽 패널) 눌러도 모달창 열기
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
