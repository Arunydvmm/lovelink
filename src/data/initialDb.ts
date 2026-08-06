import { Template, Category, Coupon, LegalPage, Announcement, Story, Order } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'girlfriend_day', name: 'Girlfriend Day', description: 'Surprise her with a romantic story of your sweet journey.', iconName: 'Heart' },
  { id: 'boyfriend_day', name: 'Boyfriend Day', description: 'Show him how much he means with a custom memory page.', iconName: 'Sparkles' },
  { id: 'proposal', name: 'Proposal', description: 'Ask the big question with interactive "Yes/No" magic.', iconName: 'Ring' },
  { id: 'anniversary', name: 'Anniversary', description: 'Celebrate years of togetherness with timelines & galleries.', iconName: 'Calendar' },
  { id: 'birthday', name: 'Birthday', description: 'Fun interactive birthday cards with scratch cards & cakes.', iconName: 'Gift' },
  { id: 'valentine', name: 'Valentine\'s Day', description: 'Express deep love with custom music & romantic reveals.', iconName: 'Flame' },
  { id: 'friendship', name: 'Friendship Day', description: 'Reminisce crazy friendship moments with photo carousels.', iconName: 'Smile' },
  { id: 'festival', name: 'Festivals', description: 'Diwali, Christmas, New Year & Holi interactive wishes.', iconName: 'Sun' },
];

export const INITIAL_TEMPLATES: Template[] = [
  {
    id: 'tmpl_proposal_universe',
    name: 'Eternal Starry Proposal',
    slug: 'eternal-starry-proposal',
    category: 'proposal',
    coverImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80'
    ],
    price: 299,
    salePrice: 149,
    description: 'An interactive romantic proposal experience with starry ambient particles, photo timeline, love scratch card, and the famous runaway "No" button interactive question!',
    estimatedTime: '4 mins',
    isFeatured: true,
    isTrending: true,
    isPremium: true,
    status: 'published',
    version: 1,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    theme: {
      primaryColor: '#e11d48',
      secondaryColor: '#f43f5e',
      backgroundColor: '#0f172a',
      textColor: '#f8fafc',
      fontFamily: 'Playfair Display',
      particleType: 'stars',
      heartFloating: true
    },
    music: {
      url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112239.mp3',
      title: 'A Thousand Years (Piano Instrumental)',
      autoplay: true
    },
    sections: [
      {
        id: 'sec_1',
        title: 'A Message From My Heart',
        backgroundStyle: 'dark_romantic',
        components: [
          {
            id: 'cmp_1',
            type: 'heading',
            props: {
              title: 'Dearest {{recipientName}}',
              subtitle: 'From {{senderName}} with all my love',
              size: 'large',
              align: 'center'
            }
          },
          {
            id: 'cmp_2',
            type: 'text',
            props: {
              content: '{{mainMessage}}',
              align: 'center'
            }
          }
        ]
      },
      {
        id: 'sec_2',
        title: 'Our Beautiful Journey Together',
        backgroundStyle: 'glass',
        components: [
          {
            id: 'cmp_3',
            type: 'timeline',
            props: {
              itemsKey: 'timelineEvents'
            }
          }
        ]
      },
      {
        id: 'sec_3',
        title: 'Our Favorite Moments',
        backgroundStyle: 'solid',
        components: [
          {
            id: 'cmp_4',
            type: 'gallery',
            props: {
              imagesKey: 'photoGallery',
              layout: 'carousel'
            }
          }
        ]
      },
      {
        id: 'sec_4',
        title: 'A Secret Surprise For You',
        backgroundStyle: 'sunset',
        components: [
          {
            id: 'cmp_5',
            type: 'scratch_card',
            props: {
              coverText: 'Scratch Here To Reveal Secret Code',
              hiddenMessageKey: 'scratchMessage',
              hiddenImageKey: 'scratchImage'
            }
          },
          {
            id: 'cmp_6',
            type: 'gift_box',
            props: {
              coverText: 'Tap To Unwrap Your Special Gift Box 🎁',
              giftMessageKey: 'giftMessage'
            }
          }
        ]
      },
      {
        id: 'sec_5',
        title: 'The Big Question',
        backgroundStyle: 'hearts',
        components: [
          {
            id: 'cmp_7',
            type: 'interactive_question',
            props: {
              question: 'Will You Marry Me and Spend Forever With Me?',
              yesButtonText: 'YES! A Million Times Yes! ❤️',
              noButtonText: 'No 😜',
              successMessage: 'YAY! You made me the happiest person in the world! 💍✨'
            }
          },
          {
            id: 'cmp_8',
            type: 'certificate',
            props: {
              title: 'Certificate of Eternal Love',
              recipientKey: 'recipientName',
              senderKey: 'senderName',
              reasonKey: 'certificateReason'
            }
          }
        ]
      }
    ],
    fields: [
      {
        id: 'f_1',
        key: 'senderName',
        label: 'Your Name (Sender)',
        type: 'text',
        stepName: 'Basic Details',
        placeholder: 'e.g., Alex',
        required: true,
        defaultValue: 'Alex'
      },
      {
        id: 'f_2',
        key: 'recipientName',
        label: 'Partner Name (Recipient)',
        type: 'text',
        stepName: 'Basic Details',
        placeholder: 'e.g., Sophia',
        required: true,
        defaultValue: 'Sophia'
      },
      {
        id: 'f_3',
        key: 'mainMessage',
        label: 'Romantic Love Message',
        type: 'textarea',
        stepName: 'Heartfelt Message',
        placeholder: 'Write your heartfelt message here...',
        required: true,
        defaultValue: 'Ever since you entered my life, every moment has felt like magic. You bring warmth to my cold days, laughter to my quiet moments, and endless love to my soul.'
      },
      {
        id: 'f_4',
        key: 'timelineEvents',
        label: 'Our Milestones & Timeline',
        type: 'timeline_items',
        stepName: 'Timeline & Moments',
        defaultValue: [
          { date: '12 June 2022', title: 'The Day We Met', description: 'A cozy coffee shop conversation that lasted for 4 hours.', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80' },
          { date: '14 Feb 2023', title: 'First Trip Together', description: 'Watching sunset at the beach under a canopy of stars.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
          { date: 'Today', title: 'Beginning of Forever', description: 'Taking our love story to the ultimate chapter.', image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80' }
        ]
      },
      {
        id: 'f_5',
        key: 'photoGallery',
        label: 'Photo Memories Gallery',
        type: 'gallery_upload',
        stepName: 'Photos',
        defaultValue: [
          'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        id: 'f_6',
        key: 'scratchMessage',
        label: 'Hidden Scratch Message',
        type: 'text',
        stepName: 'Surprises',
        defaultValue: 'You have won my heart forever & a lifetime promise of warm hugs!'
      },
      {
        id: 'f_7',
        key: 'giftMessage',
        label: 'Gift Box Secret Note',
        type: 'textarea',
        stepName: 'Surprises',
        defaultValue: 'Your official gift is a weekend getaway to your favorite beach resorts! Pack your bags darling 🧳💖'
      },
      {
        id: 'f_8',
        key: 'certificateReason',
        label: 'Certificate Citation / Reason',
        type: 'textarea',
        stepName: 'Certificate',
        defaultValue: 'For being the most gentle, loving, inspiring, and beautiful human being in my life.'
      }
    ],
    defaultContent: {}
  },
  {
    id: 'tmpl_girlfriend_day',
    name: 'Girlfriend Day Sweet Memories',
    slug: 'girlfriend-day-sweet-memories',
    category: 'girlfriend_day',
    coverImage: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=800&q=80'
    ],
    price: 0, // FREE Template!
    salePrice: 0,
    description: 'Celebrate National Girlfriend Day with a cute interactive page filled with reasons why she is special, flip cards, photo wall, and romantic music.',
    estimatedTime: '2 mins',
    isFeatured: true,
    isTrending: true,
    isPremium: false,
    status: 'published',
    version: 1,
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
    theme: {
      primaryColor: '#ec4899',
      secondaryColor: '#f472b6',
      backgroundColor: '#fff1f2',
      textColor: '#881337',
      fontFamily: 'Plus Jakarta Sans',
      particleType: 'petals',
      heartFloating: true
    },
    sections: [
      {
        id: 'sec_gf1',
        title: 'Happy Girlfriend Day!',
        backgroundStyle: 'gradient',
        components: [
          {
            id: 'cmp_gf1',
            type: 'heading',
            props: {
              title: 'Happy Girlfriend Day, {{recipientName}}! 🌸',
              subtitle: 'Made with love by {{senderName}}',
              size: 'large',
              align: 'center'
            }
          },
          {
            id: 'cmp_gf2',
            type: 'text',
            props: {
              content: '{{mainMessage}}',
              align: 'center'
            }
          }
        ]
      },
      {
        id: 'sec_gf2',
        title: 'Flip Cards: Why You Are The Best',
        backgroundStyle: 'glass',
        components: [
          {
            id: 'cmp_gf3',
            type: 'flip_card',
            props: {
              frontText: 'Reason #1: Your Smile',
              backText: 'Your smile instantly brightens up my darkest days!'
            }
          },
          {
            id: 'cmp_gf4',
            type: 'flip_card',
            props: {
              frontText: 'Reason #2: Your Kindness',
              backText: 'The way you care for everyone around you inspires me every day.'
            }
          }
        ]
      },
      {
        id: 'sec_gf3',
        title: 'A Gift Just For You',
        backgroundStyle: 'hearts',
        components: [
          {
            id: 'cmp_gf5',
            type: 'gift_box',
            props: {
              coverText: 'Open Your Girlfriend Day Surprise 🎁',
              giftMessageKey: 'giftMessage'
            }
          }
        ]
      }
    ],
    fields: [
      {
        id: 'fgf_1',
        key: 'senderName',
        label: 'Your Name',
        type: 'text',
        stepName: 'Names',
        defaultValue: 'Daniel'
      },
      {
        id: 'fgf_2',
        key: 'recipientName',
        label: 'Girlfriend\'s Name',
        type: 'text',
        stepName: 'Names',
        defaultValue: 'Emma'
      },
      {
        id: 'fgf_3',
        key: 'mainMessage',
        label: 'Special Message',
        type: 'textarea',
        stepName: 'Message',
        defaultValue: 'Happy Girlfriend Day to the most amazing girl in the entire universe! Thank you for being my best friend, my confidante, and my greatest happiness.'
      },
      {
        id: 'fgf_4',
        key: 'giftMessage',
        label: 'Gift Box Secret Note',
        type: 'textarea',
        stepName: 'Surprise',
        defaultValue: 'Coupon for 100 unlimited free hugs, dinner date at your favorite restaurant, and late night ice cream!'
      }
    ],
    defaultContent: {}
  },
  {
    id: 'tmpl_birthday_party',
    name: 'Magical Birthday Celebration',
    slug: 'magical-birthday-celebration',
    category: 'birthday',
    coverImage: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
    previewImages: [
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80'
    ],
    price: 199,
    salePrice: 99,
    description: 'An interactive birthday greeting with birthday countdown, candle blow & confetti, scratch card cake reveal, and photo gallery.',
    estimatedTime: '3 mins',
    isFeatured: true,
    isTrending: false,
    isPremium: true,
    status: 'published',
    version: 1,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
    theme: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#a855f7',
      backgroundColor: '#f3e8ff',
      textColor: '#3b0764',
      fontFamily: 'Plus Jakarta Sans',
      particleType: 'sparkles',
      heartFloating: false
    },
    sections: [
      {
        id: 'sec_b1',
        title: 'Happy Birthday!',
        backgroundStyle: 'gradient',
        components: [
          {
            id: 'cmp_b1',
            type: 'heading',
            props: {
              title: '🎉 Happy Birthday {{recipientName}}! 🎂',
              subtitle: 'Wishing you the happiest year ahead!',
              size: 'large',
              align: 'center'
            }
          },
          {
            id: 'cmp_b2',
            type: 'countdown',
            props: {
              targetDateKey: 'birthdayDate',
              title: 'Time Until Birthday Celebration Starts:'
            }
          },
          {
            id: 'cmp_b3',
            type: 'scratch_card',
            props: {
              coverText: 'Scratch To Blow Candles & Reveal Cake 🎂',
              hiddenMessageKey: 'cakeMessage'
            }
          },
          {
            id: 'cmp_b4',
            type: 'confetti',
            props: {
              triggerType: 'auto'
            }
          }
        ]
      }
    ],
    fields: [
      { id: 'fb_1', key: 'recipientName', label: 'Birthday Person Name', type: 'text', stepName: 'Details', defaultValue: 'Lucas' },
      { id: 'fb_2', key: 'birthdayDate', label: 'Birthday Date & Time', type: 'date', stepName: 'Details', defaultValue: new Date().toISOString().slice(0, 10) },
      { id: 'fb_3', key: 'cakeMessage', label: 'Wish Message Inside Scratch Card', type: 'textarea', stepName: 'Wishes', defaultValue: 'May your day be filled with sweet cake, joyful laughs, and beautiful memories! Happy Birthday! 🎉🎈' }
    ],
    defaultContent: {}
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'c_1',
    code: 'LOVE20',
    discountType: 'percentage',
    discountValue: 20,
    maxUses: 500,
    usedCount: 42,
    isActive: true
  },
  {
    id: 'c_2',
    code: 'FREEGIFT',
    discountType: 'percentage',
    discountValue: 100,
    maxUses: 100,
    usedCount: 15,
    isActive: true
  }
];

export const INITIAL_LEGAL_PAGES: LegalPage[] = [
  {
    slug: 'terms',
    title: 'Terms & Conditions',
    content: `Welcome to LoveLink! By using our platform, you agree to create respectful, personalized digital surprise pages.
    1. Content Guidelines: Users must not upload offensive, illegal, or copyrighted media without rights.
    2. Digital Products: Surprises generated on LoveLink are delivered instantly via unique digital URLs.
    3. Account Integrity: Users are responsible for maintaining the privacy of their links and shared surprises.`,
    updatedAt: new Date().toISOString()
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    content: `Your privacy matters deeply to us at LoveLink.
    • We store photos and love messages securely to render your custom surprise pages.
    • We do not sell your personal memories or contact details to third parties.
    • You can delete your created stories at any time directly from your user dashboard.`,
    updatedAt: new Date().toISOString()
  },
  {
    slug: 'refund',
    title: 'Refund Policy',
    content: `Because LoveLink provides instant digital link generation, purchases are non-refundable once published. However, if you experience technical issues or accidental double charges, please reach out to support@lovelink.app and we will issue a full refund within 24 hours.`,
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_1',
    text: '💖 Valentine & Girlfriend Day Sale! Get 20% OFF with code: LOVE20',
    linkText: 'Explore Templates',
    linkUrl: '#templates',
    badge: 'SPECIAL OFFER',
    isActive: true,
    bgColor: 'bg-gradient-to-r from-rose-500 to-pink-600'
  }
];
