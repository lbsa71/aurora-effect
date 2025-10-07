"use strict";
/**
 * Core data structures for the Aurora Effect simulator
 * Based on Carroll-Nellenback et al. (2019)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlementStatus = void 0;
/**
 * Settlement status of a star system
 */
var SettlementStatus;
(function (SettlementStatus) {
    SettlementStatus["UNSETTLED"] = "unsettled";
    SettlementStatus["TARGETED"] = "targeted";
    SettlementStatus["SETTLED"] = "settled";
})(SettlementStatus || (exports.SettlementStatus = SettlementStatus = {}));
//# sourceMappingURL=types.js.map