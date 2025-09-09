// ===================================================================
// [ 메인 실행 로직 ]
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
   console.log('DOM이 준비되었습니다. 스크립트를 실행합니다.');

   initMobileMenu();
   loadInstagramFeed();
   initLookBookGallery();
   setupDesignStoryScroll(); // Design Story 애니메이션 초기화
});

// ===================================================================
// [ 공용 유틸리티 함수 ]
// ===================================================================
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
   /* 이전과 동일 */
}
async function loadInstagramFeed() {
   /* 이전과 동일 */
}
async function initLookBookGallery() {
   /* 이전과 동일 */
}

/**
 * 📄 [Design Stories] 스크롤 기반 스토리 애니메이션 및 모달 기능 설정 (최적화 버전)
 */
async function setupDesignStoryScroll() {
   const storySection = document.querySelector('#design-stories');
   if (!storySection) return;

   // 애니메이션에 필요한 요소 선택
   const scrollContainer = document.querySelector('.story-scroll-container');
   const slides = document.querySelectorAll('.story-slide');
   const storyTitle = document.getElementById('story-title');
   const storyDescription = document.getElementById('story-description');
   const storyContent = document.querySelector('.story-content');

   // [추가] 모달창 관련 요소 선택
   const storyModal = document.getElementById('storyDetailModal'); // HTML에 모달 ID가 있는지 확인하세요!

   if (
      !scrollContainer ||
      slides.length === 0 ||
      !storyTitle ||
      !storyDescription
   ) {
      return;
   }

   // [추가] 모달이 없다면 모달 기능 없이 진행
   const modalContent = storyModal
      ? storyModal.querySelector('.modal-content')
      : null;

   try {
      // 수정된 'design-stories.json' 파일을 로드합니다.
      const storyData = await fetchJSON('./data/design-stories.json');

      if (storyData.length > 0) {
         storyTitle.textContent = storyData[0].title;
         storyDescription.innerHTML = `<h3>${storyData[0].headline}</h3><p class="overview">${storyData[0].overview}</p>`;
      }

      let ticking = false;

      const handleScrollAnimation = () => {
         // ... (스크롤 애니메이션 로직은 이전 답변과 동일) ...
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

            if (
               storyData[activeIndex] &&
               storyTitle.textContent !== storyData[activeIndex].title
            ) {
               storyContent.style.opacity = 0;
               setTimeout(() => {
                  storyTitle.textContent = storyData[activeIndex].title;
                  storyDescription.innerHTML = `<h3>${storyData[activeIndex].headline}</h3><p class="overview">${storyData[activeIndex].overview}</p>`;
                  storyContent.style.opacity = 1;
               }, 300);
            }

            slides.forEach((slide, index) => {
               // ... (슬라이드 상태 업데이트 로직은 이전 답변과 동일) ...
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

      window.addEventListener('scroll', () => {
         if (!ticking) {
            window.requestAnimationFrame(() => {
               handleScrollAnimation();
               ticking = false;
            });
            ticking = true;
         }
      });

      // --- [수정] 모달 관련 로직 ---

      // 모달 기능은 모달 요소가 있을 때만 활성화
      if (storyModal && modalContent) {
         function openStoryModal(data) {
            const featuresHtml = data.features
               .map(
                  (f) =>
                     `<div class="feature-item"><h4>${f.name}</h4><p class="tech-stack"><strong>Keywords:</strong> ${f.tech.join(', ')}</p><p class="feature-desc">${f.desc}</p></div>`,
               )
               .join('');

            // '자세히 보기' 또는 '쇼핑하기' 버튼 HTML 생성
            const linkHtml = data.links.shop_category
               ? `<a href="${data.links.shop_category}" class="link-shop">Shop This Category</a>`
               : '';

            modalContent.innerHTML = `
                <button class="modal-close-btn">&times;</button>
                <h2>${data.title}</h2>
                <p class="overview">${data.overview}</p>
                <hr>
                ${featuresHtml}
                <div class="modal-links">
                   ${linkHtml}
                </div>
             `;
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

         const storyVisuals = document.querySelector('.story-visuals');
         storyVisuals.addEventListener('click', (e) => {
            const clickedSlide = e.target.closest('.story-slide.is-active');
            if (clickedSlide) {
               const activeIndex = Array.from(slides).indexOf(clickedSlide);
               if (storyData[activeIndex]) {
                  openStoryModal(storyData[activeIndex]);
               }
            }
         });
      }
   } catch (error) {
      console.error('Design Stories 애니메이션 설정 중 오류 발생:', error);
   }
}

// [참고] initMobileMenu, loadInstagramFeed, initLookBookGallery 함수는 이전과 동일하게 유지합니다.
// 여기에 다시 작성하지 않았지만, 실제 파일에는 존재해야 합니다.
