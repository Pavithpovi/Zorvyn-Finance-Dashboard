import React from 'react'
import './FinancialAnimations.css'

const FinancialAnimations = () => {
  return (
    <div className="financial-animations">
      {/* Money Flow Animation */}
      <div className="money-flow">
        <div className="dollar-sign">$</div>
        <div className="dollar-sign">$</div>
        <div className="dollar-sign">$</div>
        <div className="dollar-sign">$</div>
        <div className="dollar-sign">$</div>
      </div>

      {/* Growth Chart Animation */}
      <div className="growth-chart">
        <div className="chart-bar bar-1"></div>
        <div className="chart-bar bar-2"></div>
        <div className="chart-bar bar-3"></div>
        <div className="chart-bar bar-4"></div>
        <div className="chart-bar bar-5"></div>
      </div>

      {/* Savings Animation */}
      <div className="savings-animation">
        <div className="coin coin-1"></div>
        <div className="coin coin-2"></div>
        <div className="coin coin-3"></div>
        <div className="coin coin-4"></div>
      </div>

      {/* Investment Growth */}
      <div className="investment-growth">
        <div className="growth-line"></div>
        <div className="growth-point point-1"></div>
        <div className="growth-point point-2"></div>
        <div className="growth-point point-3"></div>
        <div className="growth-point point-4"></div>
        <div className="growth-point point-5"></div>
      </div>

      {/* Budget Circle */}
      <div className="budget-circle">
        <div className="circle-segment segment-1"></div>
        <div className="circle-segment segment-2"></div>
        <div className="circle-segment segment-3"></div>
        <div className="circle-segment segment-4"></div>
        <div className="circle-center"></div>
      </div>

      {/* Transaction Dots */}
      <div className="transaction-dots">
        <div className="dot dot-1"></div>
        <div className="dot dot-2"></div>
        <div className="dot dot-3"></div>
        <div className="dot dot-4"></div>
        <div className="dot dot-5"></div>
        <div className="dot dot-6"></div>
      </div>
    </div>
  )
}

export default FinancialAnimations