// FIX: Import the Session type to be used in function signatures.
import { Keypoint, Pose, JointAngles, Stats, Session } from '../types';

const findKeypoint = (keypoints: Keypoint[], part: string): Keypoint | undefined => {
  return keypoints.find(kp => kp.part === part);
};

// Calculates the angle at p2 formed by p1-p2-p3
const calculateAngle = (p1: Keypoint, p2: Keypoint, p3: Keypoint): number | null => {
  if (p1.score < 0.5 || p2.score < 0.5 || p3.score < 0.5) return null;

  const a = Math.sqrt(Math.pow(p2.position.x - p3.position.x, 2) + Math.pow(p2.position.y - p3.position.y, 2));
  const b = Math.sqrt(Math.pow(p1.position.x - p3.position.x, 2) + Math.pow(p1.position.y - p3.position.y, 2));
  const c = Math.sqrt(Math.pow(p1.position.x - p2.position.x, 2) + Math.pow(p1.position.y - p2.position.y, 2));
  
  if (a === 0 || c === 0) return null;

  const angleRad = Math.acos((a*a + c*c - b*b) / (2 * a * c));
  const angleDeg = angleRad * (180 / Math.PI);
  return angleDeg;
};

export const calculateAllAngles = (pose: Pose): JointAngles => {
  const { keypoints } = pose;
  
  const leftShoulder = findKeypoint(keypoints, 'leftShoulder');
  const leftElbow = findKeypoint(keypoints, 'leftElbow');
  const leftWrist = findKeypoint(keypoints, 'leftWrist');
  const rightShoulder = findKeypoint(keypoints, 'rightShoulder');
  const rightElbow = findKeypoint(keypoints, 'rightElbow');
  const rightWrist = findKeypoint(keypoints, 'rightWrist');
  
  const leftHip = findKeypoint(keypoints, 'leftHip');
  const leftKnee = findKeypoint(keypoints, 'leftKnee');
  const leftAnkle = findKeypoint(keypoints, 'leftAnkle');
  const rightHip = findKeypoint(keypoints, 'rightHip');
  const rightKnee = findKeypoint(keypoints, 'rightKnee');
  const rightAnkle = findKeypoint(keypoints, 'rightAnkle');

  return {
    leftElbow: (leftShoulder && leftElbow && leftWrist) ? calculateAngle(leftShoulder, leftElbow, leftWrist) : null,
    rightElbow: (rightShoulder && rightElbow && rightWrist) ? calculateAngle(rightShoulder, rightElbow, rightWrist) : null,
    leftKnee: (leftHip && leftKnee && leftAnkle) ? calculateAngle(leftHip, leftKnee, leftAnkle) : null,
    rightKnee: (rightHip && rightKnee && rightAnkle) ? calculateAngle(rightHip, rightKnee, rightAnkle) : null,
  };
};

// --- Drawing Utilities ---
const drawPoint = (ctx: CanvasRenderingContext2D, y: number, x: number, r: number, color: string) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
};

const drawSegment = (ctx: CanvasRenderingContext2D, [ay, ax]: number[], [by, bx]: number[], color: string, scale: number) => {
    ctx.beginPath();
    ctx.moveTo(ax * scale, ay * scale);
    ctx.lineTo(bx * scale, by * scale);
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();
};

export const drawPose = (pose: Pose, ctx: CanvasRenderingContext2D) => {
    const keypoints = pose.keypoints;
    const adjacentKeyPoints = (window as any).posenet.getAdjacentKeyPoints(keypoints, 0.5);

    keypoints.forEach(keypoint => {
        if (keypoint.score > 0.5) {
            drawPoint(ctx, keypoint.position.y, keypoint.position.x, 3, 'aqua');
        }
    });

    adjacentKeyPoints.forEach((keypoints: Keypoint[]) => {
        drawSegment(ctx,
            [keypoints[0].position.y, keypoints[0].position.x],
            [keypoints[1].position.y, keypoints[1].position.x], 'aqua', 1
        );
    });
};

// --- Statistics Utilities ---
const calculateSingleStat = (arr1: number[], arr2: number[]): Stats => {
    const len = Math.min(arr1.length, arr2.length);
    if (len === 0) return { mad: 0, mse: 0, mape: 0 };
    
    let madSum = 0;
    let mseSum = 0;
    let mapeSum = 0;
    
    for (let i = 0; i < len; i++) {
        const diff = arr1[i] - arr2[i];
        madSum += Math.abs(diff);
        mseSum += diff * diff;
        if (arr1[i] !== 0) {
            mapeSum += Math.abs(diff / arr1[i]);
        }
    }
    
    return {
        mad: madSum / len,
        mse: mseSum / len,
        mape: (mapeSum / len) * 100
    };
};

export const calculateAllStats = (
    angles1: Session['angles'],
    angles2: Session['angles']
) => {
    return {
        leftElbow: calculateSingleStat(angles1.leftElbow, angles2.leftElbow),
        rightElbow: calculateSingleStat(angles1.rightElbow, angles2.rightElbow),
        leftKnee: calculateSingleStat(angles1.leftKnee, angles2.leftKnee),
        rightKnee: calculateSingleStat(angles1.rightKnee, angles2.rightKnee),
    }
};