import { getCategoryIcon } from '../../utils/categories';

/**
 * Renders a product image. Shows the actual image_url if available,
 * otherwise falls back to the category Lucide icon.
 */
export default function ProductImage({ product, size = 'card' }) {
    const Icon = getCategoryIcon(product?.category_slug);

    const sizeStyles = {
        card: { container: { fontSize: 0, minHeight: '100%' }, iconSize: 64 },
        detail: { container: { fontSize: 0, minHeight: '100%' }, iconSize: 120 },
        cart: { container: { fontSize: 0, minHeight: '100%' }, iconSize: 36 },
    };

    const { iconSize } = sizeStyles[size] || sizeStyles.card;

    if (product?.image_url) {
        return (
            <img
                src={product.image_url}
                alt={product.name}
                className="product-img"
                onError={(e) => {
                    // If image fails to load, replace with icon fallback
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextSibling.style.display = 'flex';
                }}
            />
        );
    }

    return (
        <div className="product-img-fallback">
            <Icon size={iconSize} />
        </div>
    );
}

/**
 * Wrapper version that handles the onError fallback inline (for cases
 * where we always want a graceful fallback even if image_url exists).
 */
export function ProductImageWithFallback({ product, size = 'card' }) {
    const Icon = getCategoryIcon(product?.category_slug);
    const sizeMap = { card: 64, detail: 120, cart: 36 };
    const iconSize = sizeMap[size] || 64;

    return (
        <div className="product-img-wrapper">
            {product?.image_url ? (
                <>
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="product-img"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                        }}
                    />
                    <div className="product-img-fallback" style={{ display: 'none' }}>
                        <Icon size={iconSize} />
                    </div>
                </>
            ) : (
                <div className="product-img-fallback">
                    <Icon size={iconSize} />
                </div>
            )}
        </div>
    );
}
