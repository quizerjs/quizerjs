import { L10nService } from '@quizerjs/core';

/**
 * 生成默认 Slide 源代码
 * 使用 L10nService 获取本地化字符串
 */
export const getDefaultSlideSource = (): string => {
  const t = L10nService.t;

  return `
present quiz "quiz" {
  rules {
    rule start "intro" {
      slide {
        content text {
          quiz.title
          quiz.description
          "${t.player.quizIntroTemplate.replace('{n}', '" + quiz.questions.length + "')}"
        }
        behavior {
          transition zoom {
            duration: 500
          }
        }
      }
    }

    rule content "questions" {
      for question in quiz.questions {
        slide {
          content dynamic {
            name: "wsx-quiz-question"
            attrs {
              question: question
              quiz-id: quiz.id
            }
          }
          behavior {
            transition slide {
              speed: 300
              direction: "horizontal"
            }
          }
        }
      }
    }

    rule end "submit" {
      slide {
        content dynamic {
          name: "wsx-quiz-submit"
          attrs {
            label: "${t.player.submitButton}"
            show-progress: true
            quiz-id: quiz.id
          }
        }
        behavior {
          transition zoom {
            duration: 500
          }
        }
      }
    }
  }
}
`;
};
