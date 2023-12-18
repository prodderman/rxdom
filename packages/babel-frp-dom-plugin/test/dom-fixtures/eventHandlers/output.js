import { template as _$template } from '@frp/runtime';
import { setEventListener as _$setEventListener } from '@frp/runtime';
const _tmpl$ = /*#__PURE__*/ _$template(
  `<div id="main"><button>Click</button><button>Click</button><button>Click</button><button>Click</button><button>Click</button><button>Click Delegated</button><button>Click Delegated</button><button>Click Delegated</button><button>Click Delegated</button><button>Click Delegated</button><button>Click Capture</button></div>`
);
function hoisted1() {
  console.log('hoisted');
}
const hoisted2 = () => console.log('hoisted delegated');
const template = (context) => {
  const _div = _tmpl$(),
    _button = _div.firstChild,
    _button2 = _button.nextSibling,
    _button3 = _button2.nextSibling,
    _button4 = _button3.nextSibling,
    _button5 = _button4.nextSibling,
    _button6 = _button5.nextSibling,
    _button7 = _button6.nextSibling,
    _button8 = _button7.nextSibling,
    _button9 = _button8.nextSibling,
    _button10 = _button9.nextSibling,
    _button11 = _button10.nextSibling;
  _button.addEventListener('change', () => console.log('bound'), false);
  _$setEventListener(
    context,
    _button2,
    'change',
    [(id) => console.log('bound', id)],
    false
  );
  _$setEventListener(context, _button3, 'change', handler, false);
  _$setEventListener(context, _button4, 'change', [handler], false);
  _button5.addEventListener('change', hoisted1, false);
  _button6.addEventListener('click', () => console.log('click'), false);
  _$setEventListener(
    context,
    _button7,
    'click',
    [(event) => console.log('click', event)],
    false
  );
  _$setEventListener(context, _button8, 'click', handler, false);
  _$setEventListener(context, _button9, 'click', [handler], false);
  _button10.addEventListener('click', hoisted2, false);
  _button11.addEventListener('click', () => console.log('listener'), true);
  return _div;
};