/**
 * Animation Utilities Hook
 * Provides reusable animation functionality for React components
 */

import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Hook for managing element animations
 */
export const useAnimation = (initialVisible = false) => {
  const [isVisible, setIsVisible] = useState(initialVisible)
  const elementRef = useRef(null)

  const triggerAnimation = useCallback((animationClass) => {
    if (elementRef.current) {
      elementRef.current.classList.add(animationClass)
      setTimeout(() => {
        elementRef.current?.classList.remove(animationClass)
      }, 600)
    }
  }, [])

  return { isVisible, setIsVisible, elementRef, triggerAnimation }
}

/**
 * Hook for ripple effect on button clicks
 */
export const useRipple = () => {
  const containerRef = useRef(null)

  const createRipple = useCallback((event) => {
    const button = event.currentTarget
    const ripple = document.createElement('span')

    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    ripple.style.width = ripple.style.height = size + 'px'
    ripple.style.left = x + 'px'
    ripple.style.top = y + 'px'
    ripple.classList.add('ripple-element')

    button.appendChild(ripple)

    setTimeout(() => ripple.remove(), 600)
  }, [])

  return { containerRef, createRipple }
}

/**
 * Hook for scroll animations - trigger animation when element enters viewport
 */
export const useScrollAnimation = (threshold = 0.1) => {
  const elementRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return { elementRef, isVisible }
}

/**
 * Hook for managing loading state with animations
 */
export const useLoadingAnimation = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)
  }, [])

  const endLoading = useCallback((success = true, errorMsg = null) => {
    setIsLoading(false)
    if (errorMsg) {
      setError(errorMsg)
      setSuccess(false)
    } else {
      setSuccess(success)
      setTimeout(() => setSuccess(false), 3000)
    }
  }, [])

  return { isLoading, error, success, startLoading, endLoading, setError }
}

/**
 * Hook for input field animations and focus
 */
export const useFormAnimation = (onSubmit) => {
  const [shakeError, setShakeError] = useState(false)
  const formRef = useRef(null)

  const triggerShake = useCallback(() => {
    if (formRef.current) {
      setShakeError(true)
      setTimeout(() => setShakeError(false), 500)
    }
  }, [])

  const handleFormSubmit = useCallback(
    (e) => {
      e.preventDefault()
      if (onSubmit) {
        const result = onSubmit(e)
        if (result === false) {
          triggerShake()
        }
      }
    },
    [onSubmit, triggerShake]
  )

  return { formRef, shakeError, handleFormSubmit, triggerShake }
}

/**
 * Hook for page transition animations
 */
export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const pageRef = useRef(null)

  const transitionTo = useCallback((callback) => {
    setIsTransitioning(true)
    setTimeout(() => {
      callback()
      setIsTransitioning(false)
    }, 300)
  }, [])

  return { pageRef, isTransitioning, transitionTo }
}

/**
 * Hook for staggered animations of list items
 */
export const useStaggerAnimation = (itemCount = 0, delay = 0.1) => {
  const containerRef = useRef(null)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    return () => setIsAnimating(false)
  }, [itemCount])

  return { containerRef, isAnimating }
}

/**
 * Hook for hover animations
 */
export const useHoverAnimation = () => {
  const [isHovered, setIsHovered] = useState(false)
  const elementRef = useRef(null)

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  return {
    elementRef,
    isHovered,
    handlers: { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave }
  }
}

export default {
  useAnimation,
  useRipple,
  useScrollAnimation,
  useLoadingAnimation,
  useFormAnimation,
  usePageTransition,
  useStaggerAnimation,
  useHoverAnimation
}