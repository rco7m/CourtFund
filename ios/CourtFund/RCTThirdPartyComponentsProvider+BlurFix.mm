#import <Foundation/Foundation.h>
#import <objc/runtime.h>

#import <ReactCodegen/RCTThirdPartyComponentsProvider.h>

@implementation RCTThirdPartyComponentsProvider (BlurFix)

+ (void)load
{
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    Class cls = [RCTThirdPartyComponentsProvider class];
    SEL selector = @selector(thirdPartyFabricComponents);
    Method method = class_getClassMethod(cls, selector);
    if (method == NULL) {
      return;
    }

    IMP originalIMP = method_getImplementation(method);
    NSDictionary<NSString *, Class> *(*originalFunc)(id, SEL) =
        (NSDictionary<NSString *, Class> *(*)(id, SEL))originalIMP;

    IMP newIMP = imp_implementationWithBlock(^NSDictionary<NSString *, Class> *(id selfObject, SEL cmd) {
      NSDictionary<NSString *, Class> *base = originalFunc(selfObject, selector);
      NSMutableDictionary<NSString *, Class> *components = base != nil ? [base mutableCopy] : [NSMutableDictionary new];

      Class blurViewClass = NSClassFromString(@"BlurView");
      if (blurViewClass != nil) {
        components[@"BlurView"] = blurViewClass;
      }

      Class vibrancyViewClass = NSClassFromString(@"VibrancyView");
      if (vibrancyViewClass != nil) {
        components[@"VibrancyView"] = vibrancyViewClass;
      }

      return components;
    });

    method_setImplementation(method, newIMP);
  });
}

@end
