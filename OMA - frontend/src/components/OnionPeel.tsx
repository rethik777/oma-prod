import React, { useEffect, useState } from 'react';
import EvoraLogo from '../assets/Evoralogo.png';

const layers = [
    { label: 'OPTIMIZED', color: '#cbd7e2', cx: 200, cy: 185, r: 180, labelX: 280, labelY: 105, delay: 0, minScore: 4.0, maxScore: 5.0 },
    { label: 'STRATEGIC', color: '#92c66d', cx: 200, cy: 220, r: 145, labelX: 300, labelY: 175, delay: 150, minScore: 3.0, maxScore: 4.0 },
    { label: 'INTEGRATED', color: '#f4cc54', cx: 200, cy: 250, r: 115, labelX: 320, labelY: 255, delay: 300, minScore: 2.0, maxScore: 3.0 },
    { label: 'DEFINED', color: '#f2a900', cx: 200, cy: 280, r: 85, labelX: 310, labelY: 325, delay: 450, minScore: 1.0, maxScore: 2.0 },
    { label: 'HEROES', color: '#19d626ff', cx: 200, cy: 310, r: 55, labelX: 0, labelY: 0, delay: 600, minScore: 0.5, maxScore: 1.0 },
];

interface OnionPeelProps {
    score?: number;
}

export const OnionPeel: React.FC<OnionPeelProps> = ({ score = 5.0 }) => {
    const [visible, setVisible] = useState<boolean[]>(layers.map(() => false));
    const [hovered, setHovered] = useState<number | null>(null);

    // Calculate logo position based on score
    // Score 0.5 → y:360, Score 1.0 → y:310, Score 1.5 → y:270, Score 3.0 → y:170, Score 5.0 → y:50
    const calculateLogoPosition = (scoreValue: number) => {
        const clampedScore = Math.max(0.5, Math.min(5.0, scoreValue));
        // console.log("Score value : ",scoreValue);
        
        // console.log("Clamped Score : ",clampedScore)
        let y;
        if (clampedScore <= 1.0) {
            // Score 0.5 to 1.0: move from y:360 to y:310
            y = 360 - 100 * (clampedScore - 0.5);
        } else {
            // Score 3.0 to 5.0: move from y:170 to y:50
            y = 170 - 60 * (clampedScore - 3.0);
        }
        
        const x = 200;
        return { x: Math.round(x), y: Math.round(y) };
    };

    const logoPosition = calculateLogoPosition(score || 0);
    // const logoPosition = calculateLogoPosition(score);

    useEffect(() => {
        layers.forEach((_, i) => {
            setTimeout(() => {
                setVisible((prev) => {
                    const next = [...prev];
                    next[i] = true;
                    return next;
                });
            }, layers[i].delay);
        });
    }, []);

    return (
        <div className="flex items-center justify-between w-full select-none gap-8">
            {/* SVG Diagram */}
            <div className="flex-1">
                <svg
                    viewBox="0 0 440 400"
                    xmlns="http://www.w3.org/2000/svg"
                    fontFamily="Arial, sans-serif"
                    fontWeight="bold"
                    className="w-full h-auto max-w-[440px]"
                >
                    {/* Concentric circles */}
                    {layers.map((layer, i) => (
                        <circle
                            key={layer.label}
                            cx={layer.cx}
                            cy={layer.cy}
                            r={layer.r}
                            fill={layer.color}
                            className="cursor-pointer"
                            style={{
                                transform: `scale(${visible[i] ? (hovered === i ? 1.03 : 1) : 0})`,
                                transformOrigin: `${layer.cx}px ${layer.cy}px`,
                                opacity: visible[i] ? 1 : 0,
                                transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease',
                                filter: hovered === i ? `drop-shadow(0 0 12px ${layer.color}aa)` : 'none',
                            }}
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                        />
                    ))}

                    {/* HEROES label inside the red circle */}
                    {/* <text
                        x={200}
                        y={318}
                        fontSize="16"
                        fill="white"
                        fontWeight="bold"
                        textAnchor="middle"
                        style={{
                            opacity: visible[4] ? 1 : 0,
                            transition: 'opacity 0.5s ease',
                            transitionDelay: '800ms',
                        }}
                    >
                        HEROES
                    </text> */}

                    {/* HARTS branding - EVORA Logo positioned based on score */}
                    <image
                        href={EvoraLogo}
                        x="0"
                        y="0"
                        width="110"
                        height="85"
                        style={{
                            opacity: visible[0] ? 1 : 0,
                            transform: `translate(${logoPosition.x - 55}px, ${logoPosition.y - 42.5}px)`,
                            transition: 'transform 0.6s ease, opacity 0.6s ease',
                            transitionDelay: '300ms',
                        }}
                    />

                    {/* Subtle pulse animation on outermost ring */}
                    <circle
                        cx={200}
                        cy={200}
                        r={180}
                        fill="none"
                        stroke={`${layers[0].color}66`}
                        strokeWidth="2"
                        style={{
                            opacity: visible[0] ? 1 : 0,
                            transition: 'opacity 0.6s ease',
                        }}
                    >
                        {visible[0] && (
                            <animate
                                attributeName="r"
                                values="180;188;180"
                                dur="3s"
                                repeatCount="indefinite"
                            />
                        )}
                        {visible[0] && (
                            <animate
                                attributeName="opacity"
                                values="0.5;0;0.5"
                                dur="3s"
                                repeatCount="indefinite"
                            />
                        )}
                    </circle>
                </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-4 justify-center">
                {layers.map((layer, i) => (
                    <div
                        key={`legend-${layer.label}`}
                        className="flex items-center gap-2 cursor-pointer"
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                            opacity: visible[i] ? 1 : 0,
                            transition: 'opacity 0.5s ease',
                            transitionDelay: `${layer.delay + 200}ms`,
                        }}
                    >
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: layer.color }}
                        />
                        <span className="text-sm font-semibold text-[#1a1a1a]">
                            {layer.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
