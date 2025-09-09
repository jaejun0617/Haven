$(document).ready(function () {
   // jQuery 사용 시 이 구문으로 시작하는 것이 안전

   const galleryData = [
      // --- 가죽 소파 (sofa) ---
      {
         src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
         title: '미드센추리 그린 소파',
         category: 'sofa',
      },
      {
         src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
         title: '미드센추리 그린 소파',
         category: 'sofa',
      },
      {
         src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
         title: '미드센추리 그린 소파',
         category: 'sofa',
      },
      {
         src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
         title: '미드센추리 그린 소파',
         category: 'sofa',
      },

      // --- 패브릭 소파 (fabric-sofa) ---
      {
         src: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91',
         title: '옐로우 포인트 암체어',
         category: 'fabric-sofa',
      },
      {
         src: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab',
         title: '코지 베이지 패브릭 소파',
         category: 'fabric-sofa',
      },
      {
         src: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91',
         title: '옐로우 포인트 암체어',
         category: 'fabric-sofa',
      },
      {
         src: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36',
         title: '모던 그레이 소파',
         category: 'fabric-sofa',
      },

      // --- 리빙룸 (living-room) ---
      {
         src: 'https://images.unsplash.com/photo-1615873968403-89e068629265',
         title: '미니멀리스트 리빙룸',
         category: 'living-room',
      },
      {
         src: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace',
         title: '화이트톤 거실 인테리어',
         category: 'living-room',
      },
      {
         src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
         title: '내추럴 스타일 리빙룸',
         category: 'living-room',
      },
      {
         src: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92',
         title: '플랜테리어 거실',
         category: 'living-room',
      },
      {
         src: 'https://images.unsplash.com/photo-1615873968403-89e068629265',
         title: '미니멀리스트 리빙룸',
         category: 'living-room',
      },

      // --- 굿즈관 (goods) ---
      {
         src: 'https://images.unsplash.com/photo-1503602642458-232111445657',
         title: '내추럴 우드 스툴',
         category: 'goods',
      },
      {
         src: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88',
         title: '디자인 라탄 체어',
         category: 'goods',
      },
      {
         src: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88',
         title: '디자인 라탄 체어',
         category: 'goods',
      },
      {
         src: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88',
         title: '디자인 라탄 체어',
         category: 'goods',
      },
      {
         src: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88',
         title: '디자인 라탄 체어',
         category: 'goods',
      },
   ];
   const $gallery = $('.showroom__gallery');

   galleryData.forEach((item) => {
      const itemHTML = `
            <div class="showroom__gallery-item ${item.category}">
                <img src="${item.src}" alt="${item.title}">
                <div class="item-overlay">${item.title}</div>
            </div>
        `;

      $gallery.append(itemHTML);
   });

   $gallery.imagesLoaded(function () {
      $gallery.isotope({
         itemSelector: '.showroom__gallery-item',
         layoutMode: 'masonry',

         transitionDuration: '0.5s',
         filter: '.living-room',
      });
   });

   $('.showroom__filter').on('click', 'li', function () {
      const filterValue = $(this).attr('data-filter');
      $gallery.isotope({ filter: filterValue });

      $('.showroom__filter > li').removeClass('--active');
      $(this).addClass('--active');
   });
});
